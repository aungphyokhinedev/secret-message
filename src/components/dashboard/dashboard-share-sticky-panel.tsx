"use client";

import { QuickShareProfileButton } from "@/components/share/quick-share-profile-button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

type DashboardShareStickyPanelProps = {
  username: string;
  shareToken: string | null;
  /** Slim single row — set when the user scrolls to content below this strip. */
  compact?: boolean;
};

export function DashboardShareStickyPanel({
  username,
  shareToken,
  compact = false,
}: DashboardShareStickyPanelProps) {
  const { t } = useUiLanguage();

  const blurb = t(
    "Copy your public link in one tap and share it with friends. They open your page, sign in with Google, and can then send water splashes, gifts, and messages.",
    "တစ်ချက်နှိပ်ပြီး သင့် public လင့်ကို copy လုပ်ပြီး သူငယ်ချင်းများနှင့် မျှဝေပါ။ သူတို့က သင့်စာမျက်နှာကို ဖွင့်၊ Google ဖြင့် ဝင်ရောက်ပြီးမှ ရေပက်၊ လက်ဆောင်နှင့် စာများ ပို့နိုင်ပါသည်။",
  );

  return (
    <section
      className={cn(
        "border-t border-border/50 bg-gradient-to-b from-primary/[0.07] via-muted/25 to-muted/12 transition-[padding] duration-200 ease-out motion-reduce:transition-none",
        compact ? "shadow-sm" : "",
      )}
      aria-label={t("Share your profile link", "သင့် profile လင့်ကို မျှဝေပါ")}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl px-6 sm:px-8",
          compact
            ? "flex-row items-center justify-between gap-3 py-2.5 sm:gap-6 sm:py-3"
            : "flex-col gap-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:py-6",
        )}
      >
        <div className={cn("min-w-0 flex-1", compact ? "" : "space-y-2")}>
          <p
            className={cn(
              "font-semibold uppercase tracking-[0.14em] text-primary",
              compact
                ? "truncate text-[0.65rem] leading-tight sm:text-[0.7rem]"
                : "text-[0.7rem] sm:text-xs",
            )}
          >
            {t("Share your Thingyan link", "သင့် သင်္ကြန်လင့်ကို မျှဝေပါ")}
          </p>
          <p
            className={cn(
              "max-w-2xl text-sm leading-relaxed text-muted-foreground",
              compact ? "sr-only" : "",
            )}
          >
            {blurb}
          </p>
        </div>
        <div
          className={cn(
            "shrink-0",
            compact ? "w-auto sm:max-w-md" : "w-full sm:w-auto sm:max-w-md sm:min-w-[15rem]",
          )}
        >
          <QuickShareProfileButton username={username} shareToken={shareToken} compact={compact} />
        </div>
      </div>
    </section>
  );
}
