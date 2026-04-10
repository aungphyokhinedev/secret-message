"use server";

import { revalidatePath } from "next/cache";

import { BLOCKED_ACCOUNT_ERROR } from "@/lib/access-control";
import { PUBLIC_MESSAGE_MAX_CHARS } from "@/lib/message-limits";
import { countSentInteractionsSinceUtcDayStart } from "@/lib/sent-interactions-daily-count";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type SendInteractionState = {
  error?: string;
  message?: string;
} | null;

const interactionTypes = [
  "water_splash",
  "black_soot",
  "food",
  "flower",
] as const satisfies readonly Database["public"]["Enums"]["interaction_type"][];
const FREE_DAILY_LIMIT = 50;
const PREMIUM_DAILY_LIMIT = 300;

function startOfUtcDayIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString();
}

function isInteractionType(value: unknown): value is (typeof interactionTypes)[number] {
  return typeof value === "string" && (interactionTypes as readonly string[]).includes(value);
}

export async function sendInteractionAction(
  _prev: SendInteractionState,
  formData: FormData,
): Promise<SendInteractionState> {
  if (!hasSupabaseEnv()) {
    return { error: "Supabase is not configured." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to send a splash or gift." };
  }

  const receiverUsername = String(formData.get("receiver_username") ?? "").trim();
  const typeRaw = formData.get("interaction_type");
  const messageRaw = String(formData.get("message") ?? "").trim();

  if (!receiverUsername) {
    return { error: "Missing profile." };
  }

  if (!isInteractionType(typeRaw)) {
    return { error: "Choose a valid interaction type." };
  }

  if (!messageRaw) {
    return { error: "Please enter a message." };
  }

  if (messageRaw.length > PUBLIC_MESSAGE_MAX_CHARS) {
    return {
      error: `Message must be at most ${PUBLIC_MESSAGE_MAX_CHARS} characters.`,
    };
  }

  const { data: receiver } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("username", receiverUsername)
    .maybeSingle();

  if (!receiver) {
    return { error: "Profile not found." };
  }

  if (receiver.id === user.id) {
    return { error: "You cannot send an interaction to yourself." };
  }

  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("is_premium, is_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (senderProfile?.is_blocked) {
    return { error: BLOCKED_ACCOUNT_ERROR };
  }

  const dailyLimit = senderProfile?.is_premium ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT;
  const used = await countSentInteractionsSinceUtcDayStart(supabase, startOfUtcDayIso(), user.id);
  if (used >= dailyLimit) {
    return {
      error: `Daily send limit reached (${dailyLimit}). Upgrade to premium for up to ${PREMIUM_DAILY_LIMIT} per day.`,
    };
  }

  const { error } = await supabase.from("interactions").insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    type: typeRaw,
    message: messageRaw,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${receiverUsername}`);

  return { message: "Sent! They will see it on their home feed." };
}
