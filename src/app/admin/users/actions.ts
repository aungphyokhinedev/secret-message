"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminUpdateFlagsResult = { ok: true } | { ok: false; error: string };

export async function adminUpdateUserFlagsAction(
  userId: string,
  isPremium: boolean,
  isBlocked: boolean,
): Promise<AdminUpdateFlagsResult> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!me?.is_admin) return { ok: false, error: "Admin access required." };

  const { data, error } = await supabase.rpc("admin_update_user_flags", {
    p_target_user_id: userId,
    p_is_premium: isPremium,
    p_is_blocked: isBlocked,
  });

  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Update failed." };

  revalidatePath("/admin/users");
  revalidatePath("/dashboard");
  return { ok: true };
}

