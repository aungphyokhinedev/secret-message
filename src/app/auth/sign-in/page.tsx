import { redirect } from "next/navigation";
import Image from "next/image";

import { OAuthGoogleButton } from "@/components/auth/oauth-google-button";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error: urlError, next: nextParam } = await searchParams;
  const afterAuth = safeRedirectPath(nextParam);
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center px-6 py-10">
        <section className="mx-auto w-full max-w-lg rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-700">
          <h1 className="text-xl font-semibold">Supabase setup required</h1>
          <p className="mt-2 text-sm">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart
            the dev server.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(afterAuth);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-orange-50 px-6 py-10">
      <section className="mx-auto w-full max-w-6xl">
        <div className="relative px-2 py-6 text-center sm:px-6">
          <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-indigo-300/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -right-16 h-44 w-44 rounded-full bg-orange-300/25 blur-2xl" />
          <p className="text-sm font-semibold text-slate-600">Online Thingyan</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Welcome to Online Thingyan
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-600 sm:text-base">
            Celebrate Myanmar Thingyan online by sharing your public profile, receiving playful
            splashes and gifts, and capturing festival moments with friends.
          </p>

          <div className="mx-auto mt-6 w-full max-w-sm">
            <OAuthGoogleButton nextPath={afterAuth} />
            {urlError ? (
              <p className="mt-3 text-sm text-rose-500">{decodeURIComponent(urlError)}</p>
            ) : null}
          </div>

          <div className="mt-10 flex justify-center">
            {/* Thingyan hero illustration provided by user */}
            <Image
              src="/thingyan-hero.svg"
              alt="Thingyan festival illustration"
              width={1024}
              height={614}
              className="h-auto w-full max-w-3xl"
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
