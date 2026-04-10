"use server";

import { revalidatePath } from "next/cache";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteSentInteractionResult = { ok: true } | { ok: false; error: string };

export async function deleteSentInteractionAction(
  interactionId: string,
): Promise<DeleteSentInteractionResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const id = interactionId.trim();
  if (!id) {
    return { ok: false, error: "Missing interaction." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to manage your messages." };
  }

  const { data: deleted, error } = await supabase.rpc("delete_own_sent_interaction", {
    p_id: id,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (deleted !== true) {
    return { ok: false, error: "Could not delete. It may have already been removed." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
