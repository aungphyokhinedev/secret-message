"use client";

import { Share2 } from "lucide-react";

import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type DashboardAccountDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
};

export function DashboardAccountDialog({ open, onOpenChange, userEmail }: DashboardAccountDialogProps) {
  const { t } = useUiLanguage();

  function openSharePanel() {
    window.dispatchEvent(new CustomEvent("secretgift:open-share-panel"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle>{t("Account", "အကောင့်")}</DialogTitle>
          <DialogDescription>
            {t("Your sign-in details and profile sharing.", "ဝင်ရောက်မှုနှင့် profile မျှဝေခြင်း။")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 px-6 py-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t("Email", "အီးမိလ်")}
            </p>
            <p className="break-all text-sm text-foreground">{userEmail.trim() || "—"}</p>
          </div>
          <Separator />
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={openSharePanel}
          >
            <Share2 className="size-4 shrink-0" aria-hidden />
            {t("Share profile", "Profile မျှဝေရန်")}
          </Button>
          <Separator />
          <SignOutButton className="w-full justify-center" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
