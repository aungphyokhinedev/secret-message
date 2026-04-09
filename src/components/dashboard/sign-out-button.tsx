"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const [loading, setLoading] = useState(false);

  async function onSignOut() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={onSignOut}
      disabled={loading}
      className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
