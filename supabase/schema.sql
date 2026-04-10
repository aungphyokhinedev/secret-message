create extension if not exists "pgcrypto";

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_email text not null,
  encrypted_content text not null,
  unlock_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.gifts (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  gift_type text not null check (gift_type in ('coupon', 'video', 'voice', 'image')),
  gift_payload jsonb not null,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;
alter table public.gifts enable row level security;
alter table public.messages force row level security;
alter table public.gifts force row level security;

drop policy if exists "users can manage own messages" on public.messages;
create policy "users can manage own messages"
on public.messages
for all
using (auth.uid() = sender_id)
with check (auth.uid() = sender_id);

drop policy if exists "users can manage own gifts" on public.gifts;
create policy "users can manage own gifts"
on public.gifts
for all
using (
  exists (
    select 1
    from public.messages m
    where m.id = gifts.message_id
      and m.sender_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.messages m
    where m.id = gifts.message_id
      and m.sender_id = auth.uid()
  )
);

-- ==========================================
-- Water Festival social interactions schema
-- ==========================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  avatar_url text,
  is_premium boolean not null default false,
  is_blocked boolean not null default false
);
alter table public.profiles
add column if not exists is_admin boolean not null default false;

create table if not exists public.profile_share_links (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  share_token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'interaction_type') then
    create type public.interaction_type as enum ('water_splash', 'black_soot', 'food', 'flower');
  end if;
end
$$;

create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  type public.interaction_type not null,
  message text,
  created_at timestamptz not null default now(),
  constraint interactions_sender_receiver_check check (sender_id <> receiver_id)
);
alter table public.interactions
add column if not exists receiver_read_at timestamptz;

-- Sender soft-delete: row stays in DB; hidden from both parties in interactions_feed.
alter table public.interactions
add column if not exists sender_deleted_at timestamptz;

create index if not exists interactions_sender_id_idx on public.interactions (sender_id);
create index if not exists interactions_receiver_id_idx on public.interactions (receiver_id);
create index if not exists interactions_created_at_idx on public.interactions (created_at desc);

alter table public.profiles enable row level security;
alter table public.interactions enable row level security;
alter table public.profile_share_links enable row level security;
alter table public.profiles force row level security;
alter table public.interactions force row level security;
alter table public.profile_share_links force row level security;

-- Profiles are readable by authenticated users and writable only by owner.
drop policy if exists "profiles are readable by authenticated users" on public.profiles;
create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can read own share link" on public.profile_share_links;
create policy "users can read own share link"
on public.profile_share_links
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "users can insert own share link" on public.profile_share_links;
create policy "users can insert own share link"
on public.profile_share_links
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "users can update own share link" on public.profile_share_links;
create policy "users can update own share link"
on public.profile_share_links
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Direct table reads are blocked; app should read via the masked view below.
revoke select on public.interactions from anon, authenticated;

drop policy if exists "users can create outgoing interactions" on public.interactions;
create policy "users can create outgoing interactions"
on public.interactions
for insert
to authenticated
with check (
  auth.uid() = sender_id
  and exists (
    select 1 from public.profiles p where p.id = receiver_id
  )
);

-- Keep reads constrained by RLS for service/internal queries.
drop policy if exists "users can read own related interactions" on public.interactions;
create policy "users can read own related interactions"
on public.interactions
for select
to authenticated
using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Soft-delete only: use RPC delete_own_sent_interaction (sets sender_deleted_at). No client DELETE.
drop policy if exists "users can delete own sent interactions" on public.interactions;

revoke delete on table public.interactions from authenticated;

-- Sets sender_deleted_at so the row remains but interactions_feed hides it for sender and receiver.
create or replace function public.delete_own_sent_interaction(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  if p_id is null then
    return false;
  end if;
  set local row_security = off;
  update public.interactions
  set sender_deleted_at = now()
  where id = p_id
    and sender_id = auth.uid()
    and sender_deleted_at is null;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

revoke all on function public.delete_own_sent_interaction(uuid) from public;
grant execute on function public.delete_own_sent_interaction(uuid) to authenticated;

-- Daily send limits count all sends today (including soft-deleted rows).
create or replace function public.count_own_sent_interactions_since(p_since timestamptz)
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int
  from public.interactions
  where sender_id = auth.uid()
    and created_at >= coalesce(p_since, '-infinity'::timestamptz);
$$;

revoke all on function public.count_own_sent_interactions_since(timestamptz) from public;
grant execute on function public.count_own_sent_interactions_since(timestamptz) to authenticated;

create or replace view public.interactions_feed as
select
  i.id,
  case
    when auth.uid() = i.sender_id then i.sender_id
    when rp.is_premium then i.sender_id
    else null
  end as sender_id,
  i.receiver_id,
  i.type,
  i.message,
  i.created_at,
  i.receiver_read_at
from public.interactions i
join public.profiles rp on rp.id = i.receiver_id
where (auth.uid() = i.sender_id or auth.uid() = i.receiver_id)
  and i.sender_deleted_at is null;

grant select on public.interactions_feed to authenticated;

create or replace function public.get_profile_by_share_token(p_token text)
returns table (id uuid, username text, avatar_url text)
language sql
security definer
set search_path = public
as $$
  select p.id, p.username, p.avatar_url
  from public.profile_share_links s
  join public.profiles p on p.id = s.user_id
  where s.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_profile_by_share_token(text) from public;
grant execute on function public.get_profile_by_share_token(text) to authenticated;

create or replace function public.rotate_own_share_token()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  new_token text := replace(gen_random_uuid()::text, '-', '');
begin
  update public.profile_share_links
  set share_token = new_token,
      updated_at = now()
  where user_id = auth.uid();

  if not found then
    insert into public.profile_share_links (user_id, share_token)
    values (auth.uid(), new_token)
    on conflict (user_id)
    do update
      set share_token = excluded.share_token,
          updated_at = now();
  end if;

  return new_token;
end;
$$;

revoke all on function public.rotate_own_share_token() from public;
grant execute on function public.rotate_own_share_token() to authenticated;

create or replace function public.admin_update_user_flags(
  p_target_user_id uuid,
  p_is_premium boolean,
  p_is_blocked boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean := false;
begin
  select p.is_admin into caller_is_admin
  from public.profiles p
  where p.id = auth.uid();

  if coalesce(caller_is_admin, false) is not true then
    raise exception 'not_admin';
  end if;

  update public.profiles
  set is_premium = coalesce(p_is_premium, is_premium),
      is_blocked = coalesce(p_is_blocked, is_blocked)
  where id = p_target_user_id;

  return found;
end;
$$;

revoke all on function public.admin_update_user_flags(uuid, boolean, boolean) from public;
grant execute on function public.admin_update_user_flags(uuid, boolean, boolean) to authenticated;

create or replace function public.mark_interaction_read(p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  n int;
begin
  update public.interactions
  set receiver_read_at = coalesce(receiver_read_at, now())
  where id = p_id
    and receiver_id = auth.uid()
    and sender_deleted_at is null;

  get diagnostics n = row_count;
  return n > 0;
end;
$$;

revoke all on function public.mark_interaction_read(uuid) from public;
grant execute on function public.mark_interaction_read(uuid) to authenticated;

-- ==========================================
-- Avatar storage bucket + policies
-- ==========================================

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatars are publicly readable" on storage.objects;
create policy "avatars are publicly readable"
on storage.objects
for select
to public
using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatar objects" on storage.objects;
create policy "users can upload own avatar objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can update own avatar objects" on storage.objects;
create policy "users can update own avatar objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "users can delete own avatar objects" on storage.objects;
create policy "users can delete own avatar objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
