import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/layout/navbar";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  let user: { email?: string | null } | null = null;

  if (hasSupabaseEnv()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      <Navbar userEmail={user?.email} />
      <main>
        <Hero isSignedIn={Boolean(user)} />
        <Features />
      </main>
      <footer className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8 text-xs text-slate-400">
        <p>Build private moments with SecretGift.</p>
        <p>{user ? `Signed in as ${user.email}` : "Not signed in"}</p>
      </footer>
    </div>
  );
}
