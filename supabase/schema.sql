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
  is_premium boolean not null default false
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

create index if not exists interactions_sender_id_idx on public.interactions (sender_id);
create index if not exists interactions_receiver_id_idx on public.interactions (receiver_id);
create index if not exists interactions_created_at_idx on public.interactions (created_at desc);

alter table public.profiles enable row level security;
alter table public.interactions enable row level security;

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
  i.created_at
from public.interactions i
join public.profiles rp on rp.id = i.receiver_id
where auth.uid() = i.sender_id or auth.uid() = i.receiver_id;

grant select on public.interactions_feed to authenticated;

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
