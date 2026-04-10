"use client";

import { Loader2, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
};

const TYPE_LABEL: Record<InteractionType, string> = {
  water_splash: "Water splash",
  black_soot: "Black soot",
  food: "Sweet gift",
  flower: "Flower gift",
};

/** After last animation frame, delay (ms) before cross-fading to the message. */
const REVEAL_DELAY_MS = 380;

/** Message layer exit duration (ms) before replay restarts the sprite — keep in sync with CSS transition. */
const MESSAGE_OUT_MS = 420;

export function InteractionStageCard({
  open,
  onClose,
  type,
  receiverUsername: _receiverUsername,
  senderLabel,
  senderAvatarUrl,
  message,
}: InteractionStageCardProps) {
  const { t } = useUiLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const [sheetStatus, setSheetStatus] = useState<"loading" | "ready" | "missing">("loading");
  const [replayToken, setReplayToken] = useState(0);
  /** `animation` = sprite playing in panel; `message` = message visible after animation ends. */
  const [panelView, setPanelView] = useState<"animation" | "message">("animation");
  /** True while the message plays its exit animation before replay. */
  const [isMessageLeaving, setIsMessageLeaving] = useState(false);

  const safeMessage = useMemo(() => {
    const trimmed = message.trim();
    return trimmed.length > 0 ? trimmed : t("No message text.", "စာသားမပါရှိပါ။");
  }, [message, t]);

  useEffect(() => {
    if (sheetStatus === "missing") {
      setPanelView("message");
    }
  }, [sheetStatus]);

  useEffect(() => {
    if (panelView === "animation") {
      setIsMessageLeaving(false);
    }
  }, [panelView]);

  useEffect(() => {
    if (open) {
      setIsMessageLeaving(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

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
        const fps = 4;
        const frameCount = 16;
        const frameDurationMs = 1000 / fps;
        const elapsedSinceRunStart = time - runStartMs;
        const effectiveTime = Math.max(0, elapsedSinceRunStart);
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
        /** Pixels to shave off each frame cell in the sprite sheet (removes grid/border lines). */
        const sourceTrim = Math.min(6, Math.max(0, Math.floor(Math.min(frameW, frameH) / 8) - 1));
        /** Inset on the canvas when drawing (extra crop on screen). */
        const destTrim = Math.min(4, Math.floor(Math.min(w, h) / 32));
        const sx = col * frameW + sourceTrim;
        const sy = row * frameH + sourceTrim;
        const sw = Math.max(1, frameW - sourceTrim * 2);
        const sh = Math.max(1, frameH - sourceTrim * 2);
        const dw = w - destTrim * 2;
        const dh = h - destTrim * 2;
        try {
          ctx.drawImage(sheet, sx, sy, sw, sh, destTrim, destTrim, dw, dh);
        } catch {
          if (!cancelled) setSheetStatus("missing");
          return;
        }

        if (frameIndex >= frameCount - 1) {
          if (!hasMarkedEnd) {
            hasMarkedEnd = true;
            revealTimerRef.current = window.setTimeout(() => {
              if (!cancelled) setPanelView("message");
            }, REVEAL_DELAY_MS);
          }
        }

        if (frameIndex < frameCount - 1) {
          animRaf = window.requestAnimationFrame((nextTime) => render(sheet, nextTime, runStartMs));
        }
      };

      async function loadFirstAvailable() {
        setSheetStatus("loading");
        setPanelView("animation");
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
  }, [open, type, replayToken]);

  const animationLayerVisible = panelView === "animation" && sheetStatus !== "missing";
  const messageShown = panelView === "message" || sheetStatus === "missing";

  function scheduleReplay() {
    if (isMessageLeaving || sheetStatus !== "ready") return;
    setIsMessageLeaving(true);
    window.setTimeout(() => {
      setReplayToken((v) => v + 1);
    }, MESSAGE_OUT_MS);
  }

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
          "max-h-[min(92vh,800px)] gap-0 overflow-y-auto p-0 sm:max-w-lg",
          "border border-border bg-card text-card-foreground shadow-sm ring-0",
        )}
      >
        <DialogHeader className="gap-2 border-b border-border px-5 py-5 pr-12 text-left sm:px-6 sm:pr-14">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
              {t("Your gift", "လက်ဆောင်")}
            </DialogTitle>
            <Badge variant="secondary" className="font-normal">
              {TYPE_LABEL[type]}
            </Badge>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
            {t(
              "Watch the animation, then read their message. You can replay anytime.",
              "Animation ကြည့်ပြီး စာကို ဖတ်ပါ။ ပြန်ဖွင့်ချင်ပါက ပြန်ဖွင့်နိုင်သည်။",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-border bg-muted/30 px-5 py-5 sm:px-6">
          <Card className="gap-0 overflow-hidden border border-border bg-card py-0 shadow-none ring-0">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4 pb-3">
              <Avatar size="default" className="size-10 shrink-0">
                {senderAvatarUrl ? (
                  <AvatarImage src={senderAvatarUrl} alt={senderLabel} />
                ) : null}
                <AvatarFallback className="text-xs font-medium">
                  {profileInitialsFromLabel(senderLabel)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base font-semibold leading-tight text-foreground">
                  {senderLabel}
                </CardTitle>
                <p className="mt-0.5 text-xs text-muted-foreground">{t("Message", "စာ")}</p>
              </div>
            </CardHeader>
            <CardContent className="relative p-4 pt-0">
              <div
                className={cn(
                  "relative min-h-[12rem] overflow-hidden rounded-xl border border-border bg-muted/40",
                  "ring-1 ring-foreground/5",
                )}
              >
                {/* Animation layer — fills panel while playing */}
                <div
                  className={cn(
                    "absolute inset-0 z-20 flex items-center justify-center transition-all duration-500 ease-out",
                    animationLayerVisible
                      ? "opacity-100"
                      : "pointer-events-none -translate-y-1 scale-[0.96] opacity-0 blur-[2px]",
                  )}
                  aria-hidden={!animationLayerVisible}
                >
                  <div className="relative aspect-square h-full max-h-[min(12rem,50vw)] w-full max-w-[min(12rem,50vw)] overflow-hidden rounded-lg">
                    <canvas
                      ref={canvasRef}
                      width={720}
                      height={720}
                      className="h-full w-full object-cover"
                    />
                    {sheetStatus !== "ready" ? (
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-lg bg-background/95 px-3 text-center backdrop-blur-sm">
                        {sheetStatus === "loading" ? (
                          <>
                            <Loader2 className="size-7 animate-spin text-primary" aria-hidden />
                            <p className="text-xs font-medium text-foreground">
                              {t("Loading animation…", "Animation တင်နေသည်…")}
                            </p>
                          </>
                        ) : (
                          <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                            {t(
                              `Could not load animation. Add /public/img/${type}.png (or .webp/.jpg) as a 4×4 sprite sheet.`,
                              `Animation မတင်နိုင်ပါ။ /public/img/${type}.png (သို့ .webp/.jpg) ကို 4×4 sprite sheet အဖြစ် ထည့်ပါ။`,
                            )}
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Message layer — fades/slides in after animation; plays out before replay */}
                <div
                  className={cn(
                    "relative z-10 flex min-h-[12rem] flex-col justify-center px-4 py-5 ease-out",
                    !messageShown
                      ? "pointer-events-none translate-y-4 opacity-0 duration-500"
                      : isMessageLeaving
                        ? "pointer-events-none translate-y-2 scale-[0.99] opacity-0 blur-[1px] duration-[420ms]"
                        : "translate-y-0 opacity-100 duration-500",
                  )}
                >
                  <p className="text-sm leading-relaxed text-foreground [text-wrap:pretty]">
                    {safeMessage}
                  </p>
                </div>

                {sheetStatus === "ready" && panelView === "message" && !isMessageLeaving && (
                  <div className="absolute right-3 bottom-3 z-30">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full px-3 shadow-sm"
                      onClick={scheduleReplay}
                      aria-label={t("Replay animation", "Animation ပြန်ဖွင့်")}
                    >
                      <RotateCcw className="size-3.5" aria-hidden />
                      {t("Replay", "ပြန်ဖွင့်")}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
