"use client";

import { Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { getUnreadReceivedCountAction } from "@/app/dashboard/actions";
import { InboxNotificationTrigger } from "@/components/common/inbox-notification-trigger";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { buttonVariants } from "@/components/ui/button";

type PublicProfileHeaderNavProps = {
  /** Unread received messages for the signed-in visitor (same as dashboard). */
  unreadReceivedCount?: number;
};

export function PublicProfileHeaderNav({ unreadReceivedCount = 0 }: PublicProfileHeaderNavProps) {
  const { t } = useUiLanguage();
  const router = useRouter();
  const [isInboxNavPending, startInboxNav] = useTransition();
  const [unreadCount, setUnreadCount] = useState(unreadReceivedCount);

  useEffect(() => {
    setUnreadCount(unreadReceivedCount);
  }, [unreadReceivedCount]);

  useEffect(() => {
    const tick = async () => {
      const result = await getUnreadReceivedCountAction();
      if (result.ok) {
        setUnreadCount(result.count);
      }
    };
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <nav
      className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-3.5 sm:px-6"
      aria-label="Page navigation"
    >
      <Link
        href="/dashboard"
        className={buttonVariants({
          variant: "outline",
          size: "default",
          className: "shrink-0 gap-2 font-medium",
        })}
      >
        <Home className="size-4 shrink-0" aria-hidden />
        {t("Go back", "ပြန်ရန်")}
      </Link>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-2.5">
        <InboxNotificationTrigger
          unreadCount={unreadCount}
          pending={isInboxNavPending}
          onClick={() => {
            startInboxNav(() => {
              router.push("/dashboard#dashboard-interaction-feed");
            });
          }}
          ariaLabel={
            isInboxNavPending
              ? t("Opening dashboard…", "ဒက်ရှ်ဘုတ်ကို ဖွင့်နေသည်…")
              : unreadCount > 0
                ? t(
                    `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`,
                    `မဖတ်ရသေးသော စာ ${unreadCount} ခု`,
                  )
                : t("Open received messages", "လက်ခံမှု စာရင်းကို ဖွင့်ရန်")
          }
          title={
            isInboxNavPending
              ? t("Loading dashboard…", "ဒက်ရှ်ဘုတ် ဖွင့်နေသည်…")
              : unreadCount > 0
                ? t(
                    `${unreadCount} new — open dashboard`,
                    `အသစ် ${unreadCount} ခု — ဒက်ရှ်ဘုတ်တွင် ဖွင့်ပါ`,
                  )
                : t("Received messages", "လက်ခံမှု စာရင်း")
          }
        />
        <LanguageSwitcher className="border-0 bg-transparent p-0 shadow-none ring-0" />
        <SignOutButton icon className="border-border" />
      </div>
    </nav>
  );
}
