import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export const BLOCKED_ACCOUNT_ERROR =
  "Your account is blocked. Please contact support for help.";

export async function isUserBlocked(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", userId)
    .maybeSingle();
  return Boolean(data?.is_blocked);
}

