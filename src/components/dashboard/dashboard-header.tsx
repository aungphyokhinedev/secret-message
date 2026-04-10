"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/common/language-switcher";
import { DashboardAccountDialog } from "@/components/dashboard/dashboard-account-dialog";
import { DashboardProfileStrip } from "@/components/dashboard/dashboard-profile-strip";
import { Button } from "@/components/ui/button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type DashboardHeaderProps = {
  currentUsername: string;
  userEmail: string;
  userAvatarUrl: string | null;
};

export function DashboardHeader({ currentUsername, userEmail, userAvatarUrl }: DashboardHeaderProps) {
  const { t } = useUiLanguage();
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-row items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <DashboardProfileStrip currentUsername={currentUsername} currentAvatarUrl={userAvatarUrl} />
          <nav className="flex shrink-0 items-center gap-2" aria-label="Account">
            <LanguageSwitcher className="border-0 bg-transparent p-0 shadow-none ring-0" />
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
      <DashboardAccountDialog open={accountOpen} onOpenChange={setAccountOpen} userEmail={userEmail} />
    </>
  );
}
