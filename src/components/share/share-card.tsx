"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { useUiLanguage } from "@/components/providers/ui-language-provider";

type ShareCardProps = {
  username: string;
};

function IconCopy() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M16 1H6a2 2 0 0 0-2 2v12h2V3h10V1Zm3 4H10a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H10V7h9v14Z"
      />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M5 20h14v2H5v-2Zm7-18 5 5h-3v7h-4V7H7l5-5Z"
      />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M18 16a3 3 0 0 0-2.4 1.2l-6.9-3.45a3.33 3.33 0 0 0 0-1.5L15.6 8.8A3 3 0 1 0 15 7a2.8 2.8 0 0 0 .06.58l-6.9 3.45a3 3 0 1 0 0 1.94l6.9 3.45A2.8 2.8 0 0 0 15 17a3 3 0 1 0 3-1Z"
      />
    </svg>
  );
}

function IconOpen() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="currentColor"
        d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM19 19H5V5h6V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6h-2v6Z"
      />
    </svg>
  );
}

export function ShareCard({ username }: ShareCardProps) {
  const { t } = useUiLanguage();
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(true);
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
    if (!cardRef.current) {
      return;
    }

    setDownloading(true);
    setError(null);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4">
      <section className="mobile-glass-card w-full max-w-2xl rounded-3xl p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{t("Share profile", "Profile မျှဝေရန်")}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-700"
          >
            {t("Close", "ပိတ်ရန်")}
          </button>
        </div>

        <div
          ref={cardRef}
          className="rounded-3xl border border-indigo-200 bg-gradient-to-br from-white via-indigo-50 to-blue-50 p-5 text-center shadow-sm"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-600">SecretGift</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900">@{username}</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            {t(
              "Share your public link or let friends scan this QR to open your profile and send interactions.",
              "Public link မျှဝေပါ သို့မဟုတ် ဤ QR ကို scan လုပ်ခိုင်းပြီး သင့် profile သို့ဝင်ကာ interaction ပို့နိုင်ပါသည်။",
            )}
          </p>

          <div className="mt-5 inline-block rounded-2xl bg-white p-3 shadow-sm">
            <QRCodeSVG value={shareUrl} size={176} includeMargin />
          </div>

          <p className="mt-4 break-all text-xs text-slate-500">{shareUrl}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            onClick={downloadCard}
            disabled={downloading}
            className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-center gap-2 text-indigo-700">
              <IconDownload />
              <span className="text-sm font-semibold">{t("Download Card", "Card ဒေါင်းလုပ်")}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t(
                "Save a beautiful share image with your QR code.",
                "QR ပါဝင်သည့် share ပုံကို သိမ်းဆည်းနိုင်သည်။",
              )}
            </p>
          </button>

          <button
            onClick={() => void copyLink()}
            className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <div className="flex items-center gap-2 text-indigo-700">
              <IconCopy />
              <span className="text-sm font-semibold">
                {copied ? t("Link Copied", "Link ကူးယူပြီး") : t("Copy Public Link", "Public Link ကူးယူ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t(
                "Copy URL to clipboard and paste anywhere.",
                "Link ကို clipboard သို့ကူးယူပြီး မည်သည့်နေရာတွင်မဆို paste လုပ်ပါ။",
              )}
            </p>
          </button>

          <button
            onClick={() => void shareLink()}
            className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-left transition hover:border-orange-300 hover:bg-orange-100"
          >
            <div className="flex items-center gap-2 text-orange-700">
              <IconShare />
              <span className="text-sm font-semibold">{t("Share Link", "Link မျှဝေ")}</span>
            </div>
            <p className="mt-1 text-xs text-orange-700/80">
              {t(
                "Open native share options for apps and contacts.",
                "ဖုန်း၏ share menu ဖြင့် apps/contacts သို့ တိုက်ရိုက်မျှဝေပါ။",
              )}
            </p>
          </button>

          <Link
            href={sharePath}
            target="_blank"
            className="rounded-2xl border border-indigo-200 bg-white px-4 py-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50"
          >
            <div className="flex items-center gap-2 text-indigo-700">
              <IconOpen />
              <span className="text-sm font-semibold">{t("Open Public Page", "Public Page ဖွင့်ရန်")}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {t(
                "Preview exactly what friends will see.",
                "သူငယ်ချင်းများမြင်မည့် public page ကို တိုက်ရိုက်ကြည့်ပါ။",
              )}
            </p>
          </Link>
        </div>

        {error ? <p className="mt-3 text-sm text-rose-500">{error}</p> : null}
      </section>
    </div>
  );
}
