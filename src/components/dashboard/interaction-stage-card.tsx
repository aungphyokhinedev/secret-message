"use client";

import { toPng } from "html-to-image";
import { useEffect, useMemo, useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import type { Database } from "@/types/database";

type InteractionType = Database["public"]["Enums"]["interaction_type"];

type InteractionStageCardProps = {
  open: boolean;
  onClose: () => void;
  type: InteractionType;
  receiverUsername: string;
  receiverAvatarUrl: string | null;
  senderLabel: string;
  senderAvatarUrl: string | null;
  message: string;
  createdAt: string;
};

const TYPE_LABEL: Record<InteractionType, string> = {
  water_splash: "Water splash",
  black_soot: "Black soot",
  food: "Sweet gift",
  flower: "Flower gift",
};

const TYPE_ICON: Record<InteractionType, string> = {
  water_splash: "💧",
  black_soot: "🖤",
  food: "🍡",
  flower: "🌼",
};

export function InteractionStageCard({
  open,
  onClose,
  type,
  receiverUsername,
  receiverAvatarUrl,
  senderLabel,
  senderAvatarUrl,
  message,
  createdAt,
}: InteractionStageCardProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  const safeMessage = useMemo(() => {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : "No message text.";
  }, [message]);

  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    const start = performance.now();

    const render = (time: number) => {
      const elapsed = (time - start) / 1000;
      const cycle = elapsed % 4.2;
      const progress = cycle / 4.2;
      const w = canvas.width;
      const h = canvas.height;
      const walkIn = Math.min(1, progress / 0.34);
      const senderX = w * (0.1 + 0.27 * walkIn);
      const receiverX = w * (0.9 - 0.27 * walkIn);
      const bodyY = h * 0.78;
      const headY = h * 0.53;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(2, 6, 23, 0.35)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(6, 30, 46, 0.5)";
      ctx.fillRect(0, h * 0.8, w, h * 0.2);

      const drawCharacter = (
        x: number,
        color: string,
        facing: "left" | "right",
        mood: "neutral" | "sad" | "surprised" | "happy" | "ashamed",
      ) => {
        const dir = facing === "right" ? 1 : -1;
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(x, headY, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.beginPath();
        ctx.arc(x - 9 * dir, headY - 6, 3.2, 0, Math.PI * 2);
        ctx.arc(x + 3 * dir, headY - 6, 3.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255,255,255,0.95)";
        ctx.lineWidth = 2.8;
        if (mood === "sad") {
          ctx.beginPath();
          ctx.arc(x - 3 * dir, headY + 10, 8, Math.PI * 0.15, Math.PI * 0.85, true);
          ctx.stroke();
        } else if (mood === "surprised") {
          ctx.beginPath();
          ctx.arc(x - 2 * dir, headY + 10, 4.6, 0, Math.PI * 2);
          ctx.stroke();
        } else if (mood === "happy") {
          ctx.beginPath();
          ctx.arc(x - 3 * dir, headY + 7, 9, Math.PI * 0.15, Math.PI * 0.85);
          ctx.stroke();
        } else if (mood === "ashamed") {
          ctx.beginPath();
          ctx.arc(x - 4 * dir, headY + 9, 6, Math.PI * 0.2, Math.PI * 0.82);
          ctx.stroke();
          ctx.fillStyle = "rgba(251, 191, 36, 0.5)";
          ctx.beginPath();
          ctx.arc(x - 12 * dir, headY + 4, 3.5, 0, Math.PI * 2);
          ctx.arc(x + 7 * dir, headY + 4, 3.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(x - 8 * dir, headY + 10);
          ctx.lineTo(x + 2 * dir, headY + 10);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(x, headY + 28);
        ctx.lineTo(x, bodyY);
        ctx.stroke();

        const legSwing = Math.sin(elapsed * 7.5) * (1 - Math.min(1, (progress - 0.34) / 0.1));
        ctx.beginPath();
        ctx.moveTo(x, bodyY - 2);
        ctx.lineTo(x - 20 + legSwing * 6 * dir, bodyY + 36);
        ctx.moveTo(x, bodyY);
        ctx.lineTo(x + 20 - legSwing * 6 * dir, bodyY + 36);
        ctx.stroke();

        const armReach = Math.min(1, Math.max(0, (progress - 0.34) / 0.2));
        ctx.beginPath();
        ctx.moveTo(x, headY + 44);
        ctx.lineTo(x - 22 * dir, headY + 64);
        ctx.moveTo(x, headY + 44);
        ctx.lineTo(x + (10 + armReach * 26) * dir, headY + 56 - armReach * 8);
        ctx.stroke();
      };

      const receiverMoodByType: Record<InteractionType, "sad" | "surprised" | "happy" | "ashamed"> = {
        black_soot: "sad",
        water_splash: "surprised",
        food: "happy",
        flower: "ashamed",
      };
      drawCharacter(senderX, "rgba(103, 232, 249, 0.95)", "right", "neutral");
      drawCharacter(receiverX, "rgba(250, 204, 21, 0.95)", "left", receiverMoodByType[type]);

      if (type === "water_splash") {
        const toss = Math.min(1, Math.max(0, (progress - 0.42) / 0.34));
        const bucketX = senderX + 36 + toss * 38;
        const bucketY = headY + 38 - toss * 16;

        ctx.font = "40px sans-serif";
        ctx.fillText("🪣", bucketX - 20, bucketY);

        for (let i = 0; i < 22; i += 1) {
          const t = (i / 21) * toss;
          const x = bucketX + t * (receiverX - bucketX - 18);
          const arcY = bucketY - 140 * t * (1 - t);
          const y = arcY + 16;
          const r = 3 + (i % 3);
          ctx.fillStyle = "rgba(34, 211, 238, 0.78)";
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (type === "black_soot") {
        const reach = Math.min(1, Math.max(0, (progress - 0.42) / 0.34));
        const handX = senderX + 30 + reach * (receiverX - senderX - 40);
        const handY = headY + 26 - Math.sin(reach * Math.PI) * 28;

        ctx.font = "38px sans-serif";
        ctx.fillText("✋🏿", handX - 16, handY);

        const sootCount = Math.floor(8 + reach * 18);
        for (let i = 0; i < sootCount; i += 1) {
          const a = (Math.PI * 2 * i) / sootCount;
          const sx = receiverX + Math.cos(a) * (9 + (i % 3) * 6);
          const sy = headY + Math.sin(a) * (8 + (i % 4) * 4);
          ctx.fillStyle = "rgba(17, 24, 39, 0.72)";
          ctx.beginPath();
          ctx.arc(sx, sy, 4 + (i % 3), 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (type === "food") {
        const pass = Math.min(1, Math.max(0, (progress - 0.42) / 0.34));
        const plateX = senderX + 28 + pass * (receiverX - senderX - 54);
        const plateY = headY + 55 - 18 * Math.sin(pass * Math.PI);
        ctx.font = "42px sans-serif";
        ctx.fillText("🍽️", plateX - 22, plateY + 4);

        const sweets = ["🍡", "🥥", "🍡", "🥥", "🍡"];
        ctx.font = "26px sans-serif";
        for (let i = 0; i < sweets.length; i += 1) {
          const a = elapsed * 2.2 + i * 1.2;
          const sx = plateX + Math.cos(a) * 34;
          const sy = plateY - 12 + Math.sin(a) * 12;
          ctx.fillText(sweets[i], sx - 10, sy);
        }
      }

      if (type === "flower") {
        const give = Math.min(1, Math.max(0, (progress - 0.42) / 0.34));
        const flowerX = senderX + 26 + give * (receiverX - senderX - 50);
        const flowerY = headY + 28 - 10 * Math.sin(give * Math.PI);
        ctx.font = "38px sans-serif";
        ctx.fillText("💐", flowerX - 16, flowerY);

        ctx.font = "24px sans-serif";
        for (let i = 0; i < 8; i += 1) {
          const drift = (elapsed * 40 + i * 42) % 140;
          const fx = receiverX - 44 + ((i * 17) % 92);
          const fy = headY - 68 + drift;
          ctx.globalAlpha = 0.55;
          ctx.fillText("🌼", fx, fy);
          ctx.globalAlpha = 1;
        }
      }

      rafId = window.requestAnimationFrame(render);
    };

    rafId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(rafId);
  }, [open, type]);

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
      setError("Could not create screenshot. Please try again.");
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
        setShareStatus("Shared successfully.");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `thingyan-${type}-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setShareStatus("Web Share unavailable. Downloaded image instead.");
      }
    } catch {
      setError("Could not share screenshot. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <section className="w-full max-w-2xl rounded-2xl border border-cyan-300/25 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-black p-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-cyan-200">Interaction animation</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-100 hover:border-cyan-300 hover:text-cyan-200"
          >
            Close
          </button>
        </div>

        <div
          ref={stageRef}
          className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-slate-200">
              <Avatar src={senderAvatarUrl} size={28} className="h-7 w-7" />
              <span>{senderLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-cyan-200">
              <span>@{receiverUsername}</span>
              <Avatar src={receiverAvatarUrl} size={28} className="h-7 w-7" />
            </div>
          </div>

          <div className="relative h-56">
            <canvas ref={canvasRef} width={960} height={440} className="h-full w-full" />
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-xs text-white">
              <p className="font-semibold text-cyan-200">
                {TYPE_ICON[type]} {TYPE_LABEL[type]}
              </p>
              <p className="mt-1">{new Date(createdAt).toLocaleString()}</p>
            </div>
            <div className="pointer-events-none absolute inset-x-3 bottom-3 rounded-lg border border-white/10 bg-black/55 px-3 py-2 text-xs text-slate-100">
              <p className="text-cyan-200">{senderLabel} says:</p>
              <p className="mt-1">{safeMessage}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void shareImage()}
            disabled={busy}
            className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Working..." : "Share Stage"}
          </button>
          <button
            type="button"
            onClick={() => void downloadPng()}
            disabled={busy}
            className="rounded-full border border-white/20 px-3 py-2 text-xs font-medium text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download PNG
          </button>
        </div>

        {shareStatus ? <p className="mt-2 text-xs text-emerald-300">{shareStatus}</p> : null}
        {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
      </section>
    </div>
  );
}
