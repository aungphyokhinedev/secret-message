"use client";

import type { ReactNode } from "react";
import { Share2 } from "lucide-react";
import { useMemo, useState } from "react";

import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShareProfileNativeButtonProps = {
  username: string;
  shareToken: string | null;
  children: ReactNode;
  className?: string;
  size?: "sm" | "default";
  pulseHighlight?: boolean;
};

/**
 * Shares the user’s public profile URL via the device share sheet (other apps).
 * Falls back to clipboard, then opening the full share dialog if needed.
 */
export function ShareProfileNativeButton({
  username,
  shareToken,
  children,
  className,
  size = "sm",
  pulseHighlight = false,
}: ShareProfileNativeButtonProps) {
  const { t } = useUiLanguage();
  const [busy, setBusy] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const path = shareToken ? `/p/${shareToken}` : `/u/${username}`;
    return `${window.location.origin}${path}`;
  }, [username, shareToken]);

  async function fallbackAfterShareFailure() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      window.dispatchEvent(new Event("secretgift:open-share-panel"));
    }
  }

  async function handleClick() {
    if (!shareUrl || busy) {
      return;
    }
    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "SecretGift profile",
            text: t(
              "Send me a message or a virtual gift.",
              "Message သို့မဟုတ် လက်ဆောင်တစ်ခု ပို့လိုက်ပါ။",
            ),
            url: shareUrl,
          });
        } catch (e: unknown) {
          const name = e && typeof e === "object" && "name" in e ? String((e as { name: string }).name) : "";
          if (name === "AbortError") {
            return;
          }
          await fallbackAfterShareFailure();
        }
      } else {
        await fallbackAfterShareFailure();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      disabled={busy}
      className={cn(
        "gap-1.5 font-medium",
        size === "sm" && "h-9 px-3 text-xs",
        size === "default" && "h-10 px-3 text-sm",
        pulseHighlight &&
          "z-[1] scale-[1.02] border-primary/50 bg-primary/[0.12] shadow-md ring-2 ring-primary/35 motion-safe:animate-pulse",
        className,
      )}
      title={t("Share profile link with another app", "အခြား app ဖြင့် profile လင့် မျှဝေရန်")}
      onClick={() => void handleClick()}
      aria-label={t("Share profile — send link to another app", "Profile မျှဝေရန် — app တခုခုသို့ လင့် ပို့ပါ")}
    >
      <Share2 className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
      {children}
    </Button>
  );
}
