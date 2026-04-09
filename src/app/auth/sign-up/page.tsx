import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeRedirectPath } from "@/lib/safe-redirect-path";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SignUpPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { next: nextParam } = await searchParams;
  const afterAuth = safeRedirectPath(nextParam);
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10">
        <section className="mx-auto w-full max-w-lg rounded-2xl border border-amber-300/30 bg-amber-500/10 p-6 text-amber-100">
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
    <main className="flex min-h-screen items-center bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10">
      <AuthForm mode="sign-up" redirectTo={afterAuth} />
    </main>
  );
}
