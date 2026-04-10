"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
  /** Compact icon-only button (e.g. dashboard toolbar). */
  icon?: boolean;
};

export function SignOutButton({ className = "", icon = false }: SignOutButtonProps) {
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

  const label = t("Sign Out", "ထွက်ရန်");

  if (icon) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onSignOut}
        disabled={loading}
        className={cn("size-9 shrink-0 rounded-full", className)}
        title={loading ? t("Signing out...", "ထွက်နေသည်...") : label}
        aria-label={label}
      >
        <LogOut className="size-4" aria-hidden />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onSignOut}
      disabled={loading}
      className={cn("rounded-full", className)}
    >
      {loading ? t("Signing out...", "ထွက်နေသည်...") : label}
    </Button>
  );
}
