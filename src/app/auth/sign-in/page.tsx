import { redirect } from "next/navigation";

import { LandingHeader } from "@/components/landing/landing-header";
import { SignInLanding } from "@/components/landing/sign-in-landing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InlineCode } from "@/components/ui/typography";
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
      <div className="min-h-screen bg-background">
        <LandingHeader />
        <main className="flex min-h-[calc(100vh-7rem)] items-center justify-center px-4 py-10 sm:px-6">
          <Card className="w-full max-w-lg border-amber-500/30 bg-amber-500/10 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10">
            <CardHeader>
              <CardTitle className="text-amber-950 dark:text-amber-100">Supabase setup required</CardTitle>
              <CardDescription className="text-amber-950/80 dark:text-amber-50/90">
                Add environment variables and restart the dev server.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-amber-950/90 dark:text-amber-50/90">
              <p>
                Set <InlineCode>NEXT_PUBLIC_SUPABASE_URL</InlineCode> and{" "}
                <InlineCode>NEXT_PUBLIC_SUPABASE_ANON_KEY</InlineCode> in{" "}
                <InlineCode>.env.local</InlineCode>.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
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
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <SignInLanding afterAuth={afterAuth} urlError={urlError ?? null} />
    </div>
  );
}
