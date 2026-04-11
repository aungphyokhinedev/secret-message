"use client";

import { Link2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type QuickShareProfileButtonProps = {
  username: string;
  shareToken: string | null;
};

const TOAST_MS = 3200;

export function QuickShareProfileButton({ username, shareToken }: QuickShareProfileButtonProps) {
  const { t } = useUiLanguage();
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);

  const sharePath = shareToken ? `/p/${shareToken}` : `/u/${username}`;
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}${sharePath}`;
  }, [sharePath]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setToast({
        message: t("Your link is copied.", "သင့် လင့် copy လုပ်ပြီးပါပြီ။"),
        variant: "success",
      });
    } catch {
      setToast({
        message: t(
          "Could not copy. Try Share profile to copy the link manually.",
          "Copy မလုပ်နိုင်ပါ။ Share profile မှ လင့်ကို လက်ဖြင့်ကူးယူပါ။",
        ),
        variant: "error",
      });
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="default"
        onClick={() => void handleCopy()}
        title={t("Copy profile link to share with friends", "သူငယ်ချင်းများနှင့် မျှဝေရန် profile လင့်ကို copy")}
        className="relative h-11 w-full min-w-0 gap-2 rounded-lg border border-primary/25 bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:h-11 sm:min-w-[14rem] sm:px-5"
        aria-label={t("Copy profile link", "Profile လင့်ကို copy")}
      >
        <Link2 className="size-4 shrink-0" strokeWidth={2.25} aria-hidden />
        <span>{t("Copy profile link", "Profile လင့်ကို copy")}</span>
      </Button>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "fixed bottom-6 left-1/2 z-[100] max-w-[min(100vw-2rem,24rem)] -translate-x-1/2 rounded-lg border px-4 py-2.5 text-center text-sm shadow-lg",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
            toast.variant === "error"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-card text-foreground ring-1 ring-foreground/10",
          )}
        >
          {toast.message}
        </div>
      ) : null}
    </>
  );
}
