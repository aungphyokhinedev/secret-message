import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16+: use `proxy` instead of deprecated `middleware`.
 * Refreshes Supabase auth cookies on each matched request.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /** Public send pages (/u/:user, /p/:token) require sign-in — redirect before RSC runs. */
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const isPublicProfileSend =
    segments.length === 2 && (segments[0] === "u" || segments[0] === "p");

  if (isPublicProfileSend && !user) {
    const path = pathname.endsWith("/") && pathname.length > 1 ? pathname.slice(0, -1) : pathname;
    const nextTarget = `${path}${request.nextUrl.search}`;
    const signIn = new URL("/auth/sign-in", request.nextUrl.origin);
    signIn.searchParams.set("next", nextTarget);
    return NextResponse.redirect(signIn);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
