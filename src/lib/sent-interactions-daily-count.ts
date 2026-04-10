import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Counts the caller’s sends since `dayStartIso` (UTC day start), including soft-deleted rows.
 * Uses RPC when available; falls back to interactions_feed count (excludes soft-deleted).
 */
export async function countSentInteractionsSinceUtcDayStart(
  supabase: SupabaseClient<Database>,
  dayStartIso: string,
  senderId: string,
): Promise<number> {
  const { data, error } = await supabase.rpc("count_own_sent_interactions_since", {
    p_since: dayStartIso,
  });
  if (!error && typeof data === "number") {
    return data;
  }

  const { count } = await supabase
    .from("interactions_feed")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", senderId)
    .gte("created_at", dayStartIso);

  return count ?? 0;
}
