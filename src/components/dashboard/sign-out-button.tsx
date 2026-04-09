"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

export function SignOutButton() {
  const router = useRouter();
  const supabase = useSupabaseBrowser();
  const { t } = useUiLanguage();
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
      className="rounded-full border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? t("Signing out...", "ထွက်နေသည်...") : t("Sign Out", "ထွက်ရန်")}
    </button>
  );
}
