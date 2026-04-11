"use client";

import { RefreshCw } from "lucide-react";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { rotateOwnShareTokenAction } from "@/app/dashboard/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

const QR_SIZE = 140;

type ShareCardProps = {
  username: string;
  shareToken: string | null;
};

export function ShareCard({ username, shareToken }: ShareCardProps) {
  const { t } = useUiLanguage();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(shareToken);
  const [rotatingToken, setRotatingToken] = useState(false);
  const [confirmRotateOpen, setConfirmRotateOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setToken(shareToken);
  }, [shareToken]);

  const sharePath = token ? `/p/${token}` : `/u/${username}`;
  const shareUrl = useMemo(() => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}${sharePath}`;
    }
    return sharePath;
  }, [sharePath]);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("secretgift:open-share-panel", onOpen);
    return () => window.removeEventListener("secretgift:open-share-panel", onOpen);
  }, []);

  async function rotateLink() {
    setError(null);
    setRotatingToken(true);
    try {
      const result = await rotateOwnShareTokenAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setToken(result.shareToken);
      setCopied(false);
    } finally {
      setRotatingToken(false);
    }
  }

  async function copyLink() {
    setError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t("Could not copy link. Please copy manually.", "Link ကို copy မလုပ်နိုင်ပါ။ လက်ဖြင့်ကူးယူပါ။"));
    }
  }

  async function shareLink() {
    setError(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: "SecretGift profile",
          text: t("Send me a message or a virtual gift.", "Message သို့မဟုတ် လက်ဆောင်တစ်ခု ပို့လိုက်ပါ။"),
          url: shareUrl,
        });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(t("Could not share link. Please try again.", "Link ကို share မလုပ်နိုင်ပါ။ ထပ်မံကြိုးစားပါ။"));
    }
  }

  async function saveQr() {
    if (!cardRef.current) return;
    setDownloading(true);
    setError(null);
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `secretgift-share-${username}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError(t("Could not save QR. Please try again.", "QR ကို သိမ်းမရပါ။ ထပ်မံကြိုးစားပါ။"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,640px)] gap-0 overflow-y-auto p-0 sm:max-w-md",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="gap-1 border-b border-border/60 px-5 py-5 text-left sm:px-6 sm:py-6 sm:pr-12">
          <DialogTitle className="text-xl font-semibold tracking-tight">
            {t("Share profile", "Profile မျှဝေရန်")}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "Copy or share your link. Friends open it and sign in to send you messages.",
              "သင့် link ကို copy သို့မဟုတ် မျှဝေပါ။ သူငယ်ချင်းများ ဖွင့်ဝင်ပြီး စာများ ပို့နိုင်သည်။",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap gap-2">
            <Button type="button" className="min-w-[7rem] flex-1 gap-2 sm:flex-initial" onClick={() => void copyLink()}>
              {copied
                ? t("Copied", "ကူးပြီး")
                : t("Copy link", "Link ကူးရန်")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="min-w-[7rem] flex-1 sm:flex-initial"
              onClick={() => void shareLink()}
            >
              {t("Share…", "မျှဝေ…")}
            </Button>
          </div>

          <p
            className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 font-mono text-[0.7rem] leading-snug text-muted-foreground sm:text-xs"
            title={shareUrl}
          >
            <span className="line-clamp-3 break-all text-foreground/90">{shareUrl}</span>
          </p>

          <div className="flex flex-col items-center gap-3">
            <div ref={cardRef} className="flex flex-col items-center gap-2">
              <p className="text-center text-sm font-medium text-foreground">@{username}</p>
              <QRCodeSVG value={shareUrl} size={QR_SIZE} includeMargin />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              disabled={downloading}
              onClick={() => void saveQr()}
            >
              {downloading ? t("Saving…", "သိမ်းနေသည်…") : t("Save QR image", "QR ပုံ သိမ်းရန်")}
            </Button>
          </div>

          <div className="border-t border-border/60 pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-auto w-full justify-start px-2 py-2 text-xs font-normal text-muted-foreground hover:text-destructive"
              disabled={rotatingToken}
              onClick={() => setConfirmRotateOpen(true)}
            >
              <RefreshCw className={cn("mr-2 size-3.5 shrink-0", rotatingToken && "animate-spin")} aria-hidden />
              {t("Regenerate link (invalidates old URL)", "လင့်အသစ်ပြန်ထုတ် (လင့်အဟောင်း ပိတ်ပါမည်)")}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="border-t border-border bg-destructive/5 px-5 py-4 text-center text-sm text-destructive sm:px-6">
            {error}
          </p>
        ) : null}
      </DialogContent>

      <AlertDialog open={confirmRotateOpen} onOpenChange={setConfirmRotateOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Regenerate profile link?", "Profile link အသစ်ပြန်ထုတ်မလား?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "Your current shared link will stop working immediately. Anyone with the old link will no longer be able to open your page.",
                "လက်ရှိမျှဝေထားသော link သည် ချက်ချင်းအလုပ်မလုပ်တော့ပါ။ link အဟောင်းရှိသူများသည် သင့်စာမျက်နှာကို မဖွင့်နိုင်တော့ပါ။",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">{t("Cancel", "ပယ်ဖျက်")}</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmRotateOpen(false);
                void rotateLink();
              }}
              disabled={rotatingToken}
            >
              {rotatingToken
                ? t("Regenerating…", "ပြန်ထုတ်နေသည်…")
                : t("Regenerate", "အသစ်ပြန်ထုတ်")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
