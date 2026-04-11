"use client";

import { Copy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TOAST_MS = 3200;

export type CopyProfileUrlButtonProps = {
  username: string;
  shareToken: string | null;
  /** Emphasis ring/pulse (e.g. after visitor sends a message on public profile). */
  pulseHighlight?: boolean;
  className?: string;
};

export function CopyProfileUrlButton({
  username,
  shareToken,
  pulseHighlight = false,
  className,
}: CopyProfileUrlButtonProps) {
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

  const label = t("Copy URL", "URL ကူးရန်");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => void handleCopy()}
        title={t("Copy your profile URL to the clipboard", "သင့် profile URL ကို clipboard သို့ ကူးယူပါ")}
        className={cn(
          "relative h-9 min-w-0 flex-1 gap-2 rounded-lg px-3 text-xs font-semibold shadow-sm transition-[box-shadow,transform,border-color,background-color] duration-300 ease-out sm:text-sm",
          "border-border bg-background text-foreground hover:bg-muted/60",
          pulseHighlight &&
            "z-[1] scale-[1.02] border-primary/50 bg-primary/[0.12] shadow-md ring-2 ring-primary/35 motion-safe:animate-pulse",
          className,
        )}
        aria-label={label}
      >
        <Copy className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
        <span className="truncate">{label}</span>
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
