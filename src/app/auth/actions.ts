"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { ensureProfileForAuthUser } from "@/lib/profile-bootstrap";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AuthActionState = {
  error?: string;
  message?: string;
} | null;

/**
 * Supabase returns generic messages; expand known cases so users know what to do.
 */
function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes("rate limit") ||
    lower.includes("email rate limit") ||
    lower.includes("too many requests")
  ) {
    return [
      "Supabase has temporarily limited auth emails for this project.",
      "Wait a few minutes and try again.",
      "For local testing: Dashboard → Authentication → Providers → Email → disable “Confirm email” so sign-up does not send a message.",
    ].join(" ");
  }
  return message;
}

async function getRequestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await ensureProfileForAuthUser(supabase, user);
  }

  const nextRaw = formData.get("next");
  const destination = safeRedirectPath(nextRaw);

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const origin = await getRequestOrigin();
  const nextRaw = formData.get("next");
  const afterConfirm = encodeURIComponent(safeRedirectPath(nextRaw));
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=${afterConfirm}`,
    },
  });

  if (error) {
    return { error: friendlyAuthError(error.message) };
  }

  if (data.session) {
    const u = data.session.user;
    await ensureProfileForAuthUser(supabase, u);

    const nextRaw = formData.get("next");
    const destination = safeRedirectPath(nextRaw);

    revalidatePath("/", "layout");
    redirect(destination);
  }

  return {
    message:
      "Account created. If email confirmation is enabled in Supabase, check your inbox and click the link before signing in.",
  };
}
