import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

import { ensureProfileForAuthUser } from "@/lib/profile-bootstrap";
import { BLOCKED_ACCOUNT_ERROR, isUserBlocked } from "@/lib/access-control";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

/**
 * Completes PKCE / email-confirmation flows by exchanging `code` for a session
 * and setting auth cookies. Add this URL to Supabase → Auth → URL Configuration
 * → Redirect URLs, e.g. http://localhost:3000/auth/callback
 */
export async function GET(request: Request) {
  const { url: supabaseUrl, anonKey } = getSupabasePublicEnv();
  const requestUrl = new URL(request.url);
  const origin = requestUrl.origin;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.redirect(new URL("/auth/sign-in", origin));
  }

  const code = requestUrl.searchParams.get("code");
  const nextPath = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=missing_code", origin));
  }

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            /* ignore */
          }
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/sign-in?error=${encodeURIComponent(error.message)}`, origin),
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await ensureProfileForAuthUser(supabase, user);
    const blocked = await isUserBlocked(supabase, user.id);
    if (blocked) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        new URL(`/auth/sign-in?error=${encodeURIComponent(BLOCKED_ACCOUNT_ERROR)}`, origin),
      );
    }
  }

  return NextResponse.redirect(new URL(nextPath, origin));
}
