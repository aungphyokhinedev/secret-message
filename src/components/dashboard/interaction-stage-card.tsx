"use client";

import { Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnvelopeRevealVisual } from "@/components/u/envelope-reveal-visual";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { profileInitialsFromLabel } from "@/lib/profile-initials";
import { cn } from "@/lib/utils";
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
  /** When set, show delete control for the sender’s own outgoing interaction. */
  onDeleteSent?: () => void;
  deleteSentPending?: boolean;
};

/** After the last sprite frame, delay (ms) before switching to the envelope. */
const SPRITE_TO_ENVELOPE_DELAY_MS = 380;

/** Slower playback for a more cinematic feel. */
const SPRITE_FPS = 2.6;

/** Time envelope stays “closed” before flap opens and the letter slides out (ms). */
const ENVELOPE_OPEN_DELAY_MS = 700;

type Stage = "sprite" | "envelope";

export function InteractionStageCard({
  open,
  onClose,
  type,
  receiverUsername: _receiverUsername,
  senderLabel,
  senderAvatarUrl,
  message,
  onDeleteSent,
  deleteSentPending = false,
}: InteractionStageCardProps) {
  const { t } = useUiLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const [sheetStatus, setSheetStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [replayToken, setReplayToken] = useState(0);
  const [stage, setStage] = useState<Stage>("sprite");
  const [envelopePhase, setEnvelopePhase] = useState<"sending" | "success">("sending");

  const safeMessage = useMemo(() => {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : t("No message text.", "စာသားမပါရှိပါ။");
  }, [message, t]);

  /** Reset to gift animation when dialog opens or a different interaction is shown. */
  useEffect(() => {
    if (!open) return;
    setStage("sprite");
    setSheetStatus("loading");
    setEnvelopePhase("sending");
    setReplayToken((v) => v + 1);
  }, [open, type, message]);

  /** Sprite sheet animation (phase 1). */
  useEffect(() => {
    if (!open || stage !== "sprite") return;

    let cancelled = false;
    let waitCanvasRaf = 0;
    let animRaf = 0;
    let waitAttempts = 0;
    const maxWaitAttempts = 90;

    const candidates = [
      `/img/${type}.png`,
      `/img/${type}.webp`,
      `/img/${type}.jpg`,
      `/img/${type}.jpeg`,
    ];

    function startWhenCanvasReady() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        waitAttempts += 1;
        if (!cancelled && waitAttempts < maxWaitAttempts) {
          waitCanvasRaf = window.requestAnimationFrame(startWhenCanvasReady);
        } else if (!cancelled) {
          setSheetStatus("missing");
        }
        return;
      }

      let hasMarkedEnd = false;

      const render = (sheet: HTMLImageElement, time: number, runStartMs: number) => {
        if (cancelled) return;
        const frameCount = 16;
        const frameDurationMs = 1000 / SPRITE_FPS;
        const elapsedSinceRunStart = time - runStartMs;
        const effectiveTime = Math.max(0, elapsedSinceRunStart);
        const frameIndex = Math.min(
          frameCount - 1,
          Math.floor(effectiveTime / frameDurationMs),
        );
        const frameProgress = Math.min(
          1,
          Math.max(0, (effectiveTime - frameIndex * frameDurationMs) / frameDurationMs),
        );
        const overallProgress = Math.min(1, Math.max(0, effectiveTime / (frameDurationMs * frameCount)));
        const eased = 0.5 - Math.cos(overallProgress * Math.PI) / 2;
        const col = frameIndex % 4;
        const row = Math.floor(frameIndex / 4);
        const w = canvas.width;
        const h = canvas.height;
        const frameW = Math.floor(sheet.width / 4);
        const frameH = Math.floor(sheet.height / 4);

        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(2, 6, 23, 0.35)";
        ctx.fillRect(0, 0, w, h);
        const glow = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.12, w * 0.5, h * 0.5, w * 0.58);
        glow.addColorStop(0, `rgba(99, 102, 241, ${0.16 + eased * 0.08})`);
        glow.addColorStop(0.65, `rgba(59, 130, 246, ${0.06 + eased * 0.05})`);
        glow.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        ctx.imageSmoothingEnabled = true;
        const sourceTrim = Math.min(6, Math.max(0, Math.floor(Math.min(frameW, frameH) / 8) - 1));
        const baseDestTrim = Math.min(4, Math.floor(Math.min(w, h) / 32));
        const breathing = Math.sin(overallProgress * Math.PI * 2 + frameProgress * Math.PI) * 0.5 + 0.5;
        const dynamicInset = baseDestTrim + eased * 6 + breathing * 3;
        const verticalDrift = Math.sin(overallProgress * Math.PI * 2.2) * 5 - 2;
        const sx = col * frameW + sourceTrim;
        const sy = row * frameH + sourceTrim;
        const sw = Math.max(1, frameW - sourceTrim * 2);
        const sh = Math.max(1, frameH - sourceTrim * 2);
        const dx = dynamicInset;
        const dy = dynamicInset + verticalDrift;
        const dw = w - dynamicInset * 2;
        const dh = h - dynamicInset * 2;
        try {
          ctx.drawImage(sheet, sx, sy, sw, sh, dx, dy, dw, dh);
        } catch {
          if (!cancelled) setSheetStatus("missing");
          return;
        }

        if (frameIndex >= frameCount - 1) {
          if (!hasMarkedEnd) {
            hasMarkedEnd = true;
            revealTimerRef.current = window.setTimeout(() => {
              if (!cancelled) setStage("envelope");
            }, SPRITE_TO_ENVELOPE_DELAY_MS);
          }
        }

        if (frameIndex < frameCount - 1) {
          animRaf = window.requestAnimationFrame((nextTime) => render(sheet, nextTime, runStartMs));
        }
      };

      async function loadFirstAvailable() {
        setSheetStatus("loading");
        if (revealTimerRef.current) {
          clearTimeout(revealTimerRef.current);
          revealTimerRef.current = null;
        }
        for (const src of candidates) {
          try {
            const img = new Image();
            img.decoding = "async";
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
            animRaf = window.requestAnimationFrame(renderTick);
            return;
          } catch {
            // try next extension
          }
        }
        if (!cancelled) setSheetStatus("missing");
      }

      void loadFirstAvailable();
    }

    startWhenCanvasReady();

    return () => {
      cancelled = true;
      if (revealTimerRef.current) {
        clearTimeout(revealTimerRef.current);
        revealTimerRef.current = null;
      }
      window.cancelAnimationFrame(waitCanvasRaf);
      window.cancelAnimationFrame(animRaf);
    };
  }, [open, stage, replayToken, type]);

  useEffect(() => {
    if (sheetStatus === "missing") {
      setStage("envelope");
    }
  }, [sheetStatus]);

  /** Envelope + message (phase 2). */
  useEffect(() => {
    if (!open || stage !== "envelope") return;
    setEnvelopePhase("sending");
    const tmr = window.setTimeout(() => setEnvelopePhase("success"), ENVELOPE_OPEN_DELAY_MS);
    return () => clearTimeout(tmr);
  }, [open, stage, replayToken]);

  function scheduleReplay() {
    setStage("sprite");
    setSheetStatus("loading");
    setReplayToken((v) => v + 1);
  }

  const animationLayerVisible = stage === "sprite" && sheetStatus !== "missing";
  const showSpriteLoading = stage === "sprite" && sheetStatus === "loading";
  const showSpriteMissing = stage === "sprite" && sheetStatus === "missing";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        showCloseButton
        className={cn(
          "max-h-[min(92vh,720px)] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-md",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="border-b border-border/60 px-4 py-2.5 pr-12 text-left sm:px-5 sm:pr-14">
          <DialogTitle className="sr-only">{t("Your gift", "လက်ဆောင်")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t(
              "Animation plays first — your message appears in the envelope.",
              "Animation ပြီးမှ စာအိတ်ထဲတွင် စာကို မြင်ရပါမည်။",
            )}
          </DialogDescription>
          <div className="flex min-w-0 items-center gap-2">
            <Avatar size="sm" className="shrink-0">
              {senderAvatarUrl ? <AvatarImage src={senderAvatarUrl} alt="" /> : null}
              <AvatarFallback className="text-[0.625rem] font-medium leading-none">
                {profileInitialsFromLabel(senderLabel)}
              </AvatarFallback>
            </Avatar>
            <p
              className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium leading-tight text-foreground"
              title={senderLabel}
            >
              {senderLabel}
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4 sm:px-6 sm:py-5">
          <div className="relative min-h-[12rem] overflow-hidden rounded-xl bg-muted/35 sm:min-h-[13rem]">
            {/* Phase 1: sprite */}
            <div
              className={cn(
                "absolute inset-0 z-20 flex items-center justify-center transition-all duration-500 ease-out",
                animationLayerVisible
                  ? "opacity-100"
                  : "pointer-events-none -translate-y-1 scale-[0.96] opacity-0 blur-[2px]",
              )}
              aria-hidden={!animationLayerVisible}
            >
              <div className="relative aspect-square h-full max-h-[min(12rem,52vw)] w-full max-w-[min(12rem,52vw)] overflow-hidden rounded-lg">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={720}
                  className="h-full w-full object-cover"
                />
                {stage === "sprite" && sheetStatus !== "ready" ? (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-background/90 px-2 text-center backdrop-blur-[2px]">
                    {showSpriteLoading ? (
                      <>
                        <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
                        <p className="text-[0.6875rem] text-muted-foreground">
                          {t("Loading animation…", "Animation တင်နေသည်…")}
                        </p>
                      </>
                    ) : showSpriteMissing ? (
                      <p className="text-[0.65rem] leading-snug text-muted-foreground">
                        {t(
                          `Could not load animation. Add /public/img/${type}.png (or .webp/.jpg) as a 4×4 sprite sheet.`,
                          `Animation မတင်နိုင်ပါ။ /public/img/${type}.png (သို့ .webp/.jpg) ကို 4×4 sprite sheet အဖြစ် ထည့်ပါ။`,
                        )}
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {/* Phase 2: envelope + message on paper */}
            <div
              className={cn(
                "relative z-10 flex min-h-[12rem] flex-col items-center justify-center px-3 py-5 transition-all duration-500 ease-out sm:min-h-[13rem] sm:px-4 sm:py-6",
                stage === "envelope"
                  ? "translate-y-0 opacity-100"
                  : "pointer-events-none translate-y-3 opacity-0",
              )}
            >
              {stage === "envelope" ? (
                <EnvelopeRevealVisual
                  key={replayToken}
                  phase={envelopePhase}
                  purpose="read"
                  messageText={safeMessage}
                />
              ) : null}
            </div>
          </div>

          {stage === "envelope" && envelopePhase === "success" ? (
            <div className="flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={scheduleReplay}
                aria-label={t("Replay animation", "Animation ပြန်ဖွင့်")}
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {t("Replay", "ပြန်ဖွင့်")}
              </Button>
            </div>
          ) : null}
        </div>

        {onDeleteSent ? (
          <div className="border-t border-border/60 px-5 py-3 sm:px-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={deleteSentPending}
              className="h-9 w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDeleteSent()}
            >
              <Trash2 className="size-3.5 shrink-0" aria-hidden />
              {deleteSentPending
                ? t("Deleting…", "ဖျက်နေသည်…")
                : t("Delete from sent history", "ပို့မှု မှတ်တမ်းမှ ဖျက်ရန်")}
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
