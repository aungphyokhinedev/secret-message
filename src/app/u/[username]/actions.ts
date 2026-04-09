"use server";

import { revalidatePath } from "next/cache";

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

  const { error } = await supabase.from("interactions").insert({
    sender_id: user.id,
    receiver_id: receiver.id,
    type: typeRaw,
    message: messageRaw.slice(0, 2000),
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/u/${receiverUsername}`);

  return { message: "Sent! They will see it on their home feed." };
}
