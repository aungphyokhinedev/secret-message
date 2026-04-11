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
  /** Short label above the name (e.g. Sender). Omit for sent items — only the handle is shown. */
  peerEyebrow?: string;
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
  peerEyebrow,
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
          "max-h-[min(92vh,760px)] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-lg",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="space-y-2 border-b border-border/60 bg-muted/15 px-6 py-6 pr-12 text-left sm:px-8 sm:py-7 sm:pr-14">
          <div className="min-w-0 space-y-2">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {t("Your gift", "လက်ဆောင်")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {t(
                "Animation plays first — your message appears in the envelope.",
                "Animation ပြီးမှ စာအိတ်ထဲတွင် စာကို မြင်ရပါမည်။",
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-border/70 bg-muted/25 px-4 py-3.5 sm:px-5 sm:py-4">
            <Avatar size="default" className="size-10 shrink-0 ring-1 ring-border/60">
              {senderAvatarUrl ? <AvatarImage src={senderAvatarUrl} alt={senderLabel} /> : null}
              <AvatarFallback className="text-xs font-medium">
                {profileInitialsFromLabel(senderLabel)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              {peerEyebrow ? (
                <>
                  <p className="text-sm font-medium text-muted-foreground">{peerEyebrow}</p>
                  <p
                    className="mt-0.5 truncate text-base font-semibold leading-tight text-foreground"
                    title={senderLabel}
                  >
                    {senderLabel}
                  </p>
                </>
              ) : (
                <p
                  className="truncate text-base font-semibold leading-tight text-foreground"
                  title={senderLabel}
                >
                  {senderLabel}
                </p>
              )}
            </div>
          </div>

          <div className="relative min-h-[13rem] overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-muted/50 to-muted/25 sm:min-h-[14rem]">
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
              <div className="relative aspect-square h-full max-h-[min(13rem,56vw)] w-full max-w-[min(13rem,56vw)] overflow-hidden rounded-xl">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={720}
                  className="h-full w-full object-cover"
                />
                {stage === "sprite" && sheetStatus !== "ready" ? (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/95 px-3 text-center backdrop-blur-sm">
                    {showSpriteLoading ? (
                      <>
                        <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                        <p className="text-xs font-medium text-foreground">
                          {t("Loading animation…", "Animation တင်နေသည်…")}
                        </p>
                      </>
                    ) : showSpriteMissing ? (
                      <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
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
                "relative z-10 flex min-h-[13rem] flex-col items-center justify-center px-4 py-6 transition-all duration-500 ease-out sm:min-h-[14rem] sm:px-5 sm:py-7",
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
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="secondary"
                size="default"
                className="h-11 gap-2 rounded-full px-6 text-sm shadow-sm"
                onClick={scheduleReplay}
                aria-label={t("Replay animation", "Animation ပြန်ဖွင့်")}
              >
                <RotateCcw className="size-4" aria-hidden />
                {t("Replay", "ပြန်ဖွင့်")}
              </Button>
            </div>
          ) : null}
        </div>

        {onDeleteSent ? (
          <div className="border-t border-border/80 bg-muted/10 px-6 py-5 sm:px-8">
            <Button
              type="button"
              variant="outline"
              disabled={deleteSentPending}
              className="h-11 w-full gap-2 border-destructive/30 text-sm text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/45 dark:hover:bg-destructive/20"
              onClick={() => onDeleteSent()}
            >
              <Trash2 className="size-4 shrink-0" aria-hidden />
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
