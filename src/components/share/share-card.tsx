"use client";

import Link from "next/link";
import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

type ShareCardProps = {
  username: string;
};

export function ShareCard({ username }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
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
      setError("Could not download card. Please try again.");
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
      setError("Could not copy link. Please copy manually.");
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Share card</h2>
          <p className="text-sm text-slate-300">Share your profile with QR and direct link.</p>
        </div>
      </div>

      <div
        ref={cardRef}
        className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/20 via-slate-900 to-black p-5"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">SecretGift</p>
        <h3 className="mt-2 text-2xl font-bold text-white">@{username}</h3>
        <p className="mt-1 text-sm text-slate-200">Send me a message or a virtual gift.</p>

        <div className="mt-5 inline-block rounded-xl bg-white p-3">
          <QRCodeSVG value={shareUrl} size={168} includeMargin />
        </div>

        <p className="mt-4 text-xs text-slate-300">{shareUrl}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={downloadCard}
          disabled={downloading}
          className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {downloading ? "Downloading..." : "Download Card"}
        </button>
        <button
          onClick={() => void copyLink()}
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          {copied ? "Copied!" : "Copy Link"}
        </button>

        <Link
          href={sharePath}
          target="_blank"
          className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          Open Public Link
        </Link>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
