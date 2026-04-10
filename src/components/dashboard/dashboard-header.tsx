"use client";

import { MoreVertical, Star } from "lucide-react";
import { useState } from "react";

import { InboxNotificationTrigger } from "@/components/common/inbox-notification-trigger";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { DashboardAccountDialog } from "@/components/dashboard/dashboard-account-dialog";
import { DashboardProfileStrip } from "@/components/dashboard/dashboard-profile-strip";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type DashboardHeaderProps = {
  currentUsername: string;
  userEmail: string;
  userAvatarUrl: string | null;
  isPremium: boolean;
  dailyUsed: number;
  dailyLimit: number;
  unreadReceivedCount: number;
  onInboxClick: () => void;
};

export function DashboardHeader({
  currentUsername,
  userEmail,
  userAvatarUrl,
  isPremium,
  dailyUsed,
  dailyLimit,
  unreadReceivedCount,
  onInboxClick,
}: DashboardHeaderProps) {
  const { t } = useUiLanguage();
  const [accountOpen, setAccountOpen] = useState(false);
  const [premiumInfoOpen, setPremiumInfoOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <DashboardProfileStrip currentUsername={currentUsername} currentAvatarUrl={userAvatarUrl} />
          </div>
          <nav className="ml-4 flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label="Account">
            <div
              className="hidden rounded-md border border-border/70 bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground sm:block"
              title={t("Daily sending usage", "နေ့စဉ်ပို့မှု အသုံးပြုမှု")}
            >
              {t(`Today ${dailyUsed}/${dailyLimit}`, `ယနေ့ ${dailyUsed}/${dailyLimit}`)}
            </div>
            <InboxNotificationTrigger
              unreadCount={unreadReceivedCount}
              ariaLabel={
                unreadReceivedCount > 0
                  ? t(
                      `${unreadReceivedCount} unread message${unreadReceivedCount === 1 ? "" : "s"}`,
                      `မဖတ်ရသေးသော စာ ${unreadReceivedCount} ခု`,
                    )
                  : t("Open received messages", "လက်ခံမှု စာရင်းကို ဖွင့်ရန်")
              }
              title={
                unreadReceivedCount > 0
                  ? t(
                      `${unreadReceivedCount} new — open inbox`,
                      `အသစ် ${unreadReceivedCount} ခု — စာရင်းမှ ဖွင့်ပါ`,
                    )
                  : t("Received messages", "လက်ခံမှု စာရင်း")
              }
              onClick={onInboxClick}
            />
            <LanguageSwitcher className="border-0 bg-transparent p-0 shadow-none ring-0" />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 hover:bg-muted/60"
              onClick={() => setPremiumInfoOpen(true)}
              aria-label={t("Premium status", "Premium အခြေအနေ")}
              title={
                isPremium
                  ? t("Premium user", "Premium အသုံးပြုသူ")
                  : t("Free user", "Free အသုံးပြုသူ")
              }
            >
              <Star
                className={
                  isPremium
                    ? "size-4 fill-amber-400 text-amber-500"
                    : "size-4 fill-muted text-muted-foreground"
                }
                aria-hidden
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 shrink-0 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              onClick={() => setAccountOpen(true)}
              aria-label={t("Account menu", "အကောင့် မီနူး")}
            >
              <MoreVertical className="size-4" aria-hidden />
            </Button>
          </nav>
        </div>
      </header>
      <DashboardAccountDialog
        open={accountOpen}
        onOpenChange={setAccountOpen}
        userEmail={userEmail}
        currentUsername={currentUsername}
        userAvatarUrl={userAvatarUrl}
      />
      <Dialog open={premiumInfoOpen} onOpenChange={setPremiumInfoOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Premium membership", "Premium အဖွဲ့ဝင်မှု")}</DialogTitle>
            <DialogDescription className="space-y-2">
              <span className="block">
                {isPremium
                  ? t("Your account is premium.", "သင့်အကောင့်သည် Premium ဖြစ်ပါသည်။")
                  : t("Your account is currently free.", "သင့်အကောင့်သည် လက်ရှိ Free ဖြစ်ပါသည်။")}
              </span>
              <span className="block">
                {t(
                  "Premium users can always see sender identities in received interactions.",
                  "Premium အသုံးပြုသူများသည် လက်ခံထားသော interaction များတွင် ပို့သူအမည်ကို အမြဲမြင်နိုင်သည်။",
                )}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPremiumInfoOpen(false)}>
              {t("Close", "ပိတ်မည်")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
