import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export function toSafeUsername(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

function avatarUrlFromUser(user: User): string | null {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (!meta) return null;
  const a = meta.avatar_url ?? meta.picture;
  return typeof a === "string" && a.trim() ? a.trim() : null;
}

function preferredUsernameBase(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    meta &&
    (typeof meta.preferred_username === "string"
      ? meta.preferred_username
      : typeof meta.user_name === "string"
        ? meta.user_name
        : typeof meta.full_name === "string"
          ? meta.full_name
          : typeof meta.name === "string"
            ? meta.name
            : "");
  const fromEmail = user.email?.split("@")[0] ?? "";
  const raw = (fromMeta || fromEmail).trim();
  const safe = toSafeUsername(raw);
  return safe || `user_${user.id.slice(0, 8)}`;
}

/**
 * Ensures a `profiles` row exists for the given auth user and refreshes avatar (and username on first insert)
 * from email / OAuth metadata when available.
 */
export async function ensureProfileForAuthUser(
  supabase: SupabaseClient<Database>,
  user: User,
) {
  const avatarUrl = avatarUrlFromUser(user);

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    if (avatarUrl) {
      await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id);
    }
    await supabase.from("profile_share_links").upsert({ user_id: user.id });
    return existing.username;
  }

  let base = preferredUsernameBase(user);
  const { data: clash } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", base)
    .maybeSingle();

  if (clash) {
    base = `${toSafeUsername(base.slice(0, 12))}_${user.id.slice(0, 8)}`.slice(0, 24);
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    username: base,
    avatar_url: avatarUrl,
    is_premium: false,
  });
  await supabase.from("profile_share_links").upsert({ user_id: user.id });

  const { data: refreshed } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .maybeSingle();

  return refreshed?.username ?? base;
}
