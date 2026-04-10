"use client";

import { Mail } from "lucide-react";

import { Avatar } from "@/components/common/avatar";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { P, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

type DashboardAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  currentUsername: string;
  userAvatarUrl: string | null;
};

export function DashboardAccountDialog({
  open,
  onOpenChange,
  userEmail,
  currentUsername,
  userAvatarUrl,
}: DashboardAccountDialogProps) {
  const { t } = useUiLanguage();
  const handle = currentUsername.trim() || "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <DialogHeader
          className={cn(
            "border-b border-border/80 bg-gradient-to-br from-muted/50 via-muted/25 to-background",
            "px-6 pb-5 pt-6 text-left",
          )}
        >
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-full p-0.5 ring-2 ring-border/60 shadow-sm">
              <Avatar
                src={userAvatarUrl}
                size={56}
                className="h-14 w-14"
                alt={handle === "—" ? t("Profile avatar", "Profile avatar") : handle}
                fallbackLabel={t("Profile avatar", "Profile avatar")}
              />
            </div>
            <div className="min-w-0 flex-1 space-y-0.5">
              <DialogTitle
                className="truncate text-left text-lg font-semibold leading-tight tracking-tight"
                title={handle === "—" ? undefined : handle}
              >
                {handle}
              </DialogTitle>
              <DialogDescription className="text-left text-xs leading-snug">
                {t("Signed in — your account details below.", "ဝင်ရောက်ထားသည် — အောက်တွင် အကောင့် အချက်အလက်များ။")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="flex gap-3 rounded-xl border border-border/80 bg-card/80 p-3.5 shadow-sm">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/70 text-muted-foreground"
              aria-hidden
            >
              <Mail className="size-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <Small className="text-[0.68rem] font-medium uppercase tracking-wide text-muted-foreground">
                {t("Email", "အီးမိလ်")}
              </Small>
              <P className="mt-0.5 break-all text-sm font-medium leading-snug text-foreground">
                {userEmail.trim() || "—"}
              </P>
            </div>
          </div>

          <SignOutButton
            showLeadingIcon
            variant="destructive"
            className="h-10 w-full justify-center rounded-xl shadow-sm"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
