"use client";

import { QuickShareProfileButton } from "@/components/share/quick-share-profile-button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type DashboardShareStickyPanelProps = {
  username: string;
  shareToken: string | null;
};

export function DashboardShareStickyPanel({ username, shareToken }: DashboardShareStickyPanelProps) {
  const { t } = useUiLanguage();

  return (
    <section
      className="border-t border-border/50 bg-gradient-to-b from-primary/[0.07] via-muted/25 to-muted/12"
      aria-label={t("Share your profile link", "သင့် profile လင့်ကို မျှဝေပါ")}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-8 sm:py-6">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs">
            {t("Share your Thingyan link", "သင့် သင်္ကြန်လင့်ကို မျှဝေပါ")}
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(
              "Copy your public link in one tap and share it with friends. They open your page, sign in with Google, and can then send water splashes, gifts, and messages.",
              "တစ်ချက်နှိပ်ပြီး သင့် public လင့်ကို copy လုပ်ပြီး သူငယ်ချင်းများနှင့် မျှဝေပါ။ သူတို့က သင့်စာမျက်နှာကို ဖွင့်၊ Google ဖြင့် ဝင်ရောက်ပြီးမှ ရေပက်၊ လက်ဆောင်နှင့် စာများ ပို့နိုင်ပါသည်။",
            )}
          </p>
        </div>
        <div className="w-full shrink-0 sm:w-auto sm:max-w-md sm:min-w-[15rem]">
          <QuickShareProfileButton username={username} shareToken={shareToken} />
        </div>
      </div>
    </section>
  );
}
