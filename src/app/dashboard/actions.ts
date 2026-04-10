"use server";

import { revalidatePath } from "next/cache";

import { BLOCKED_ACCOUNT_ERROR, isUserBlocked } from "@/lib/access-control";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DeleteSentInteractionResult = { ok: true } | { ok: false; error: string };
export type RotateShareTokenResult =
  | { ok: true; shareToken: string }
  | { ok: false; error: string };
export type MarkInteractionReadResult = { ok: true } | { ok: false; error: string };

export type UnreadReceivedCountResult = { ok: true; count: number } | { ok: false };

/** Used by dashboard / public profile header polling (every 30s). */
export async function getUnreadReceivedCountAction(): Promise<UnreadReceivedCountResult> {
  if (!hasSupabaseEnv()) {
    return { ok: false };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false };
  }
  if (await isUserBlocked(supabase, user.id)) {
    return { ok: true, count: 0 };
  }

  const { count, error } = await supabase
    .from("interactions_feed")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .is("receiver_read_at", null);

  if (error) {
    return { ok: false };
  }

  return { ok: true, count: count ?? 0 };
}

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

export async function markInteractionReadAction(
  interactionId: string,
): Promise<MarkInteractionReadResult> {
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
  if (!user) return { ok: false, error: "Sign in required." };
  if (await isUserBlocked(supabase, user.id)) {
    return { ok: false, error: BLOCKED_ACCOUNT_ERROR };
  }

  const { data, error } = await supabase.rpc("mark_interaction_read", { p_id: id });
  if (error) return { ok: false, error: error.message };
  if (!data) return { ok: false, error: "Could not mark as read." };

  revalidatePath("/dashboard");
  return { ok: true };
}
