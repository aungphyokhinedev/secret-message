/**
 * Reads Supabase public env vars with trimming. Use this everywhere instead of
 * process.env.NEXT_PUBLIC_* directly so whitespace-only values never slip through.
 */
export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return { url, anonKey };
}

export function hasSupabaseEnv() {
  const { url, anonKey } = getSupabasePublicEnv();
  return url.length > 0 && anonKey.length > 0;
}

export function assertSupabaseEnv() {
  if (hasSupabaseEnv()) {
    return;
  }

  throw new Error(
    "Supabase is not configured. Create .env.local in the project root with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (copy from .env.example), then restart the dev server.",
  );
}
