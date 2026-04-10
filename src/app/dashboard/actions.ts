"use server";

import { revalidatePath } from "next/cache";

import { BLOCKED_ACCOUNT_ERROR, isUserBlocked } from "@/lib/access-control";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteSentInteractionResult = { ok: true } | { ok: false; error: string };
export type RotateShareTokenResult =
  | { ok: true; shareToken: string }
  | { ok: false; error: string };

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
  if (await isUserBlocked(supabase, user.id)) {
    return { ok: false, error: BLOCKED_ACCOUNT_ERROR };
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

export async function rotateOwnShareTokenAction(): Promise<RotateShareTokenResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to manage your share link." };
  }
  if (await isUserBlocked(supabase, user.id)) {
    return { ok: false, error: BLOCKED_ACCOUNT_ERROR };
  }

  const { data, error } = await supabase.rpc("rotate_own_share_token");
  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data || typeof data !== "string") {
    return { ok: false, error: "Could not rotate share link." };
  }

  revalidatePath("/dashboard");
  return { ok: true, shareToken: data };
}
