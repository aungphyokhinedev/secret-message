"use client";

import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import type { Database } from "@/types/database";

type InteractionType = Database["public"]["Enums"]["interaction_type"];

type InteractionStageCardProps = {
  open: boolean;
  onClose: () => void;
  type: InteractionType;
  receiverUsername: string;
  senderLabel: string;
  senderAvatarUrl: string | null;
  message: string;
};

const TYPE_LABEL: Record<InteractionType, string> = {
  water_splash: "Water splash",
  black_soot: "Black soot",
  food: "Sweet gift",
  flower: "Flower gift",
};

export function InteractionStageCard({
  open,
  onClose,
  type,
  receiverUsername,
  senderLabel,
  senderAvatarUrl,
  message,
}: InteractionStageCardProps) {
  const { t } = useUiLanguage();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [sheetStatus, setSheetStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [animationEnded, setAnimationEnded] = useState(false);
  const [replayToken, setReplayToken] = useState(0);

  const safeMessage = useMemo(() => {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : t("No message text.", "စာသားမပါရှိပါ။");
  }, [message, t]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let cancelled = false;
    let hasMarkedEnd = false;

    const render = (sheet: HTMLImageElement, time: number, runStartMs: number) => {
      const startDelayMs = 2000;
      const fps = 4;
      const frameCount = 16;
      const frameDurationMs = 1000 / fps;
      const elapsedSinceRunStart = time - runStartMs;
      const effectiveTime = Math.max(0, elapsedSinceRunStart - startDelayMs);
      const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(effectiveTime / frameDurationMs),
      );
      const col = frameIndex % 4;
      const row = Math.floor(frameIndex / 4);
      const w = canvas.width;
      const h = canvas.height;
      const frameW = Math.floor(sheet.width / 4);
      const frameH = Math.floor(sheet.height / 4);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(2, 6, 23, 0.35)";
      ctx.fillRect(0, 0, w, h);

      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        sheet,
        col * frameW,
        row * frameH,
        frameW,
        frameH,
        0,
        0,
        w,
        h,
      );

      if (frameIndex >= frameCount - 1) {
        if (!hasMarkedEnd) {
          hasMarkedEnd = true;
          setAnimationEnded(true);
        }
      }

      if (frameIndex < frameCount - 1) {
        rafId = window.requestAnimationFrame((nextTime) => render(sheet, nextTime, runStartMs));
      }
    };
    const candidates = [
      `/img/${type}.png`,
      `/img/${type}.webp`,
      `/img/${type}.jpg`,
      `/img/${type}.jpeg`,
    ];

    async function loadFirstAvailable() {
      setSheetStatus("loading");
      setAnimationEnded(false);
      for (const src of candidates) {
        try {
          const img = new Image();
          await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = () => reject(new Error("Failed"));
            img.src = src;
          });
          if (cancelled) return;
          setSheetStatus("ready");
          const runStartMs = performance.now();
          const renderTick = (time: number) => {
            if (cancelled) return;
            render(img, time, runStartMs);
          };
          rafId = window.requestAnimationFrame(renderTick);
          return;
        } catch {
          // try next extension
        }
      }
      if (!cancelled) setSheetStatus("missing");
    }

    void loadFirstAvailable();
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [open, type, replayToken]);

  async function makeBlob(): Promise<Blob> {
    if (!stageRef.current) {
      throw new Error("Stage is not ready.");
    }

    const dataUrl = await toPng(stageRef.current, { cacheBust: true, pixelRatio: 2 });
    const response = await fetch(dataUrl);
    return response.blob();
  }

  async function downloadPng() {
    setBusy(true);
    setError(null);
    setShareStatus(null);
    try {
      const blob = await makeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `thingyan-${type}-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      setShareStatus("Downloaded image.");
    } catch {
      setError(t("Could not create screenshot. Please try again.", "Screenshot မဖန်တီးနိုင်ပါ။ ထပ်ကြိုးစားပါ။"));
    } finally {
      setBusy(false);
    }
  }

  async function shareImage() {
    setBusy(true);
    setError(null);
    setShareStatus(null);
    try {
      const blob = await makeBlob();
      const file = new File([blob], `thingyan-${type}.png`, { type: "image/png" });
      const text = `${senderLabel} sent a ${TYPE_LABEL[type]} to @${receiverUsername}`;

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Thingyan interaction",
          text,
          files: [file],
        });
        setShareStatus(t("Shared successfully.", "မျှဝေပြီးပါပြီ။"));
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `thingyan-${type}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setShareStatus(t("Web Share unavailable. Downloaded image instead.", "Web Share မရရှိပါ။ Download ပြုလုပ်ပြီးပါပြီ။"));
      }
    } catch {
      setError(t("Could not share screenshot. Please try again.", "Screenshot မမျှဝေနိုင်ပါ။ ထပ်ကြိုးစားပါ။"));
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 p-2 sm:p-3">
      <section className="w-full max-w-lg rounded-2xl bg-white p-3 shadow-xl sm:p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-indigo-700">
            {t("Let's see what you have received", "သင်လက်ခံရရှိထားတာတွေကို ကြည့်ရအောင်")}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-transparent text-indigo-700 transition hover:bg-indigo-50"
            aria-label={t("Close", "ပိတ်ရန်")}
            title={t("Close", "ပိတ်ရန်")}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                fill="currentColor"
                d="M18.3 5.71 12 12l6.3 6.29-1.41 1.41L10.59 13.4 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.29l6.3 6.3 6.3-6.3 1.41 1.42Z"
              />
            </svg>
          </button>
        </div>

        <div ref={stageRef} className="overflow-hidden">
          <div className="px-3 py-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <Avatar src={senderAvatarUrl} size={30} className="h-8 w-8" />
              <div className="max-w-[290px]">
                <p className="font-medium">{senderLabel}</p>
                <div className="relative mt-1 rounded-2xl rounded-tl-sm border border-indigo-100 bg-white/75 px-3 py-2 text-sm leading-5 text-slate-700 shadow-sm backdrop-blur-sm">
                  {safeMessage}
                  <span className="absolute -left-1 top-2 h-2.5 w-2.5 rotate-45 border-b border-l border-indigo-100 bg-white/75" />
                </div>
              </div>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[200px]">
            <canvas ref={canvasRef} width={720} height={720} className="h-full w-full" />
            {sheetStatus !== "ready" ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/85 px-4 text-center text-xs text-slate-600">
                {sheetStatus === "loading"
                  ? t("Loading animation sheet...", "Animation sheet တင်နေသည်...")
                  : t(
                      `Missing sprite sheet: add /public/img/${type}.png (or .webp/.jpg/.jpeg) as a 4x4 sequence.`,
                      `Sprite sheet မတွေ့ပါ: /public/img/${type}.png (သို့ .webp/.jpg/.jpeg) ကို 4x4 sequence အဖြစ် ထည့်ပါ။`,
                    )}
              </div>
            ) : null}
            {sheetStatus === "ready" && animationEnded ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setReplayToken((v) => v + 1)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200/70 bg-white/55 text-base text-indigo-700 backdrop-blur-sm transition hover:bg-white/75"
                  aria-label="Replay animation"
                >
                  ▶
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void shareImage()}
            disabled={busy}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
            title={t("Share", "မျှဝေရန်")}
            aria-label={t("Share", "မျှဝေရန်")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="currentColor"
                d="M18 16a3 3 0 0 0-2.4 1.2l-6.9-3.45a3.33 3.33 0 0 0 0-1.5L15.6 8.8A3 3 0 1 0 15 7a2.8 2.8 0 0 0 .06.58l-6.9 3.45a3 3 0 1 0 0 1.94l6.9 3.45A2.8 2.8 0 0 0 15 17a3 3 0 1 0 3-1Z"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => void downloadPng()}
            disabled={busy}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            title={t("Save screenshot", "Screenshot သိမ်းရန်")}
            aria-label={t("Save screenshot", "Screenshot သိမ်းရန်")}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                fill="currentColor"
                d="M9 3 7.17 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.17L15 3H9Zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-1.8A3.2 3.2 0 1 0 12 9.8a3.2 3.2 0 0 0 0 6.4Z"
              />
            </svg>
          </button>
        </div>

        {shareStatus ? <p className="mt-2 text-xs text-emerald-600">{shareStatus}</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-500">{error}</p> : null}
      </section>
    </div>
  );
}
