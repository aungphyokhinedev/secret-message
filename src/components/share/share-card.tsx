"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import { Copy, Download, ExternalLink, Share2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

const actionCardClass =
  "gap-0 overflow-hidden rounded-xl border border-border bg-card p-0 py-0 shadow-none ring-0";

const actionTriggerClass = cn(
  "flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left text-sm outline-none transition-colors",
  "rounded-xl hover:bg-muted/60 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50",
  "disabled:pointer-events-none disabled:opacity-50",
);

/** Matches dashboard preview scale; PNG export still looks sharp at 2x pixelRatio. */
const QR_SIZE = 160;

type ShareCardProps = {
  username: string;
};

export function ShareCard({ username }: ShareCardProps) {
  const { t } = useUiLanguage();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sharePath = `/u/${username}`;
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
  }, [username]);

  async function downloadCard() {
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
      setError(t("Could not download card. Please try again.", "Card ကို download မလုပ်နိုင်ပါ။ ထပ်မံကြိုးစားပါ။"));
    } finally {
      setDownloading(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,760px)] gap-0 overflow-y-auto p-0 sm:max-w-lg",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="gap-2 border-b border-border px-5 py-5 text-left sm:px-6 sm:py-6">
          <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
            {t("Share profile", "Profile မျှဝေရန်")}
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "Friends can scan the QR code or use your link to open your profile and send messages and gifts.",
              "သူငယ်ချင်းများ QR code ကို scan လုပ်ပါ သို့မဟုတ် သင့် link ဖြင့်ဝင်ပြီး စာနှင့် လက်ဆောင်များ ပို့နိုင်ပါသည်။",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-5 py-6 sm:px-6">
          <div
            ref={cardRef}
            className="rounded-xl border border-border bg-muted/40 p-5 text-center shadow-none sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">SecretGift</p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">@{username}</p>
            <div className="mx-auto mt-4 inline-flex rounded-lg border border-border bg-background p-3 shadow-none">
              <QRCodeSVG value={shareUrl} size={QR_SIZE} includeMargin />
            </div>
            <p className="mt-4 break-all font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {shareUrl}
            </p>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="min-w-0 w-full flex-1 font-mono text-sm"
              aria-label={t("Public profile URL", "Public profile URL")}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full shrink-0 gap-2 rounded-lg sm:w-auto"
              onClick={() => void copyLink()}
            >
              <Copy className="size-4 shrink-0" aria-hidden />
              <span className="min-w-0 truncate">
                {copied ? t("Copied", "ကူးပြီး") : t("Copy", "ကူးယူ")}
              </span>
            </Button>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-4 px-5 pb-6 sm:px-6">
          <p className="text-sm font-medium text-foreground">
            {t("Actions", "လုပ်ဆောင်ချက်များ")}
          </p>
          <div className="flex min-w-0 flex-col gap-3">
            <Card className={actionCardClass}>
              <button
                type="button"
                className={cn(actionTriggerClass, "text-foreground")}
                onClick={() => void downloadCard()}
                disabled={downloading}
              >
                <Download className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-medium leading-snug text-foreground">
                    {t("Download card", "Card ဒေါင်းလုပ်")}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {t("PNG image with QR", "QR ပါ PNG ပုံ")}
                  </span>
                </span>
              </button>
            </Card>

            <Card className={cn(actionCardClass, "bg-secondary/10 ring-0")}>
              <button
                type="button"
                className={cn(actionTriggerClass, "text-foreground hover:bg-secondary/25")}
                onClick={() => void shareLink()}
              >
                <Share2 className="mt-0.5 size-4 shrink-0 text-foreground" aria-hidden />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-medium leading-snug text-foreground">
                    {t("Share link", "Link မျှဝေ")}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {t("System share or clipboard", "စနစ် share သို့မဟုတ် clipboard")}
                  </span>
                </span>
              </button>
            </Card>

            <Card className={actionCardClass}>
              <Link
                href={sharePath}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(actionTriggerClass, "text-foreground no-underline")}
              >
                <ExternalLink className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-medium leading-snug text-foreground">
                    {t("Open public page", "Public page ဖွင့်")}
                  </span>
                  <span className="block text-xs leading-relaxed text-muted-foreground">
                    {t("Preview as visitors see it", "ဧည့်သည်များ မြင်သည့်အတိုင်း")}
                  </span>
                </span>
              </Link>
            </Card>
          </div>
        </div>

        {error ? (
          <p className="border-t border-border bg-destructive/5 px-5 py-4 text-center text-sm text-destructive sm:px-6">
            {error}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
