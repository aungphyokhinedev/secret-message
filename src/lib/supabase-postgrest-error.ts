/**
 * Turns PostgREST errors into actionable copy when the remote DB is missing tables.
 */
export function formatSupabasePostgrestError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("schema cache") ||
    lower.includes("could not find the table") ||
    (lower.includes("relation") && lower.includes("does not exist"))
  ) {
    return [
      "The linked Supabase project does not have the app tables yet (e.g. public.messages).",
      "In Supabase: SQL → New query → paste and run supabase/schema.sql from this repo (entire file), then retry.",
    ].join(" ");
  }
  return message;
}
