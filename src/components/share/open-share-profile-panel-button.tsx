"use client";

import type { ReactNode } from "react";
import { Settings, Share2 } from "lucide-react";

import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OpenShareProfilePanelButtonProps = {
  children: ReactNode;
  className?: string;
  size?: "sm" | "default";
  /** Gear = tools panel (default); share = share glyph for “share link” entry points. */
  icon?: "settings" | "share";
  /** Emphasis ring/pulse (e.g. after visitor sends a message on public profile). */
  pulseHighlight?: boolean;
};

export function OpenShareProfilePanelButton({
  children,
  className,
  size = "sm",
  icon = "settings",
  pulseHighlight = false,
}: OpenShareProfilePanelButtonProps) {
  const { t } = useUiLanguage();
  const Icon = icon === "share" ? Share2 : Settings;
  const title =
    icon === "share"
      ? t("Share profile — QR, link, and more", "Profile မျှဝေရန် — QR၊ လင့်")
      : t("QR code, download image, and more", "QR code၊ ပုံ download နှင့် အခြား");
  const ariaLabel = t("Share profile — QR, link, and more", "Profile မျှဝေရန် — QR၊ လင့်");

  return (
    <Button
      type="button"
      variant="outline"
      size={size}
      className={cn(
        "gap-1.5 font-medium",
        size === "sm" && "h-9 px-3 text-xs",
        size === "default" && "h-10 px-3 text-sm",
        pulseHighlight &&
          "z-[1] scale-[1.02] border-primary/50 bg-primary/[0.12] shadow-md ring-2 ring-primary/35 motion-safe:animate-pulse",
        className,
      )}
      title={title}
      onClick={() => window.dispatchEvent(new Event("secretgift:open-share-panel"))}
      aria-label={ariaLabel}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={icon === "share" ? 2.25 : 2} aria-hidden />
      {children}
    </Button>
  );
}
