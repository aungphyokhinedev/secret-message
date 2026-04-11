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
import { Muted, Small } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/** Matches dashboard preview scale; PNG export still looks sharp at 2x pixelRatio. */
const QR_SIZE = 156;

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
  }, [username]);

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
          "max-h-[min(92vh,720px)] gap-0 overflow-y-auto p-0 sm:max-w-lg",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="gap-2 border-b border-border/50 bg-muted/10 px-6 py-6 pr-12 text-left sm:px-8 sm:py-7 sm:pr-14">
          <Small className="text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            {t("Online Thingyan", "အွန်လိုင်း သင်္ကြန်")}
          </Small>
          <DialogTitle className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {t("Share profile", "Profile မျှဝေရန်")}
          </DialogTitle>
          <DialogDescription className="mt-2">
            <Muted className="text-base leading-relaxed">
            {t(
              "Friends can scan the QR code or use your link to open your profile. They sign in with Google to send messages and gifts.",
              "သူငယ်ချင်းများက QR code ကို scan လုပ်ပါ သို့မဟုတ် သင့် link ဖြင့် သင့်ပရိုဖိုင်ကို ဖွင့်နိုင်သည်။ စာနှင့် လက်ဆောင်များ ပို့ရန် Google ဖြင့် ဝင်ရောက်ရပါသည်။",
            )}
            </Muted>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 pb-8 pt-6 sm:px-8 sm:pb-9 sm:pt-7">
          <section
            className="rounded-xl border border-border/70 bg-muted/25 px-4 py-3.5 sm:px-5 sm:py-4"
            aria-labelledby="share-profile-howto-heading"
          >
            <h2
              id="share-profile-howto-heading"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {t("How to share your profile", "သင့် profile ကို မျှဝေနည်း")}
            </h2>
            <ol className="mt-2.5 list-decimal space-y-2.5 pl-4 text-sm leading-snug text-foreground marker:font-medium marker:text-primary">
              <li>
                {t(
                  "Copy the link below or tap Share link to send it in chat, email, or social apps.",
                  "အောက်ရှိ link ကို copy လုပ်ပါ သို့မဟုတ် Link မျှဝေ ခလုတ်ကို နှိပ်ပြီး chat၊ email သို့မဟုတ် လူမှုကွန်ရက်တွင် ပို့ပါ။",
                )}
              </li>
              <li>
                {t(
                  "Or let friends scan the QR — show it on your phone, save it as an image, or print it.",
                  "သို့မဟုတ် သူငယ်ချင်းများကို QR ကို scan ခိုင်းပါ — ဖုန်းပေါ်တွင် ပြပါ၊ ပုံအနေဖြင့် သိမ်းပါ သို့မဟုတ် ပရင့်ထုတ်ပါ။",
                )}
              </li>
              <li>
                {t(
                  "After they sign in, they pick a splash or gift, write a short message, and send. You’ll see it in Dashboard → Received.",
                  "သူတို့ ဝင်ရောက်ပြီးနောက် ရေပက် သို့မဟုတ် လက်ဆောင်ရွေး၊ စာတိုရေးပို့ကာနိုင်သည်။ သင်သည် ဒက်ရှ်ဘုတ် → လက်ခံမှု တွင် မြင်ရပါမည်။",
                )}
              </li>
            </ol>
            <p className="mt-3 border-t border-border/50 pt-3 text-xs leading-relaxed text-muted-foreground">
              {t(
                "Use Regenerate link only if an old link was leaked — it stops the previous URL from working.",
                "လင့်အဟောင်းကို မည်သူမျှ မသင့်တော်ပါကသာ လင့်အသစ်ပြန်ထုတ် ကိုသုံးပါ — ယခင်လင့် အလုပ်မလုပ်တော့ပါ။",
              )}
            </p>
          </section>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-stretch sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full shrink-0 gap-2 rounded-lg text-sm sm:w-auto sm:px-5"
              onClick={() => setConfirmRotateOpen(true)}
              disabled={rotatingToken}
            >
              <RefreshCw className={cn("size-4 shrink-0", rotatingToken && "animate-spin")} aria-hidden />
              <span className="min-w-0 truncate">
                {rotatingToken
                  ? t("Rotating...", "ပြောင်းနေသည်...")
                  : t("Regenerate link", "လင့်အသစ်ပြန်ထုတ်")}
              </span>
            </Button>
          </div>

          <div
            ref={cardRef}
            className="rounded-2xl border border-border/80 bg-muted/30 p-6 text-center shadow-none sm:p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">SecretGift</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[1.65rem]">@{username}</p>
            <button
              type="button"
              onClick={() => void saveQr()}
              disabled={downloading}
              className="mx-auto mt-5 inline-flex rounded-xl border border-border bg-background p-3.5 shadow-sm transition-colors hover:bg-muted/40 disabled:opacity-70"
              title={t("Click QR to save image", "QR ကိုနှိပ်ပြီး ပုံကို သိမ်းပါ")}
            >
              <QRCodeSVG value={shareUrl} size={QR_SIZE} includeMargin />
            </button>
            <button
              type="button"
              onClick={() => void copyLink()}
              className={cn(
                "share-profile-dialog__link-field relative z-0 mt-5 w-full overflow-hidden rounded-xl border-2 border-border bg-background/90 px-3 py-2.5 text-left font-mono text-xs leading-relaxed text-foreground underline-offset-2 transition-colors sm:text-sm",
                "hover:bg-muted/35 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35",
              )}
              title={t("Click to copy link", "Link ကိုကူးယူရန် နှိပ်ပါ")}
            >
              <span className="relative z-[1] block break-all">{shareUrl}</span>
            </button>
            {copied ? (
              <p className="mt-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                {t("Copied to clipboard", "Clipboard သို့ ကူးယူပြီး")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "share-profile-dialog__share-cta h-11 w-full rounded-lg border-2 text-sm font-semibold",
              )}
              onClick={() => void shareLink()}
            >
              {t("Share link", "Link မျှဝေ")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg text-sm"
              onClick={() => void saveQr()}
              disabled={downloading}
            >
              {downloading ? t("Saving…", "သိမ်းနေသည်…") : t("Save QR", "QR သိမ်းရန်")}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="border-t border-border bg-destructive/5 px-6 py-5 text-center text-sm leading-relaxed text-destructive sm:px-8">
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
