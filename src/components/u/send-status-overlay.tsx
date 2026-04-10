"use client";

import { EnvelopeRevealVisual } from "@/components/u/envelope-reveal-visual";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Muted, Small } from "@/components/ui/typography";

type SendStatusOverlayProps = {
  phase: "hidden" | "sending" | "success";
  /** Increment to replay the success animation on each send. */
  successPlayId: number;
};

export function SendStatusOverlay({
  phase,
  successPlayId,
}: SendStatusOverlayProps) {
  const { t } = useUiLanguage();

  if (phase === "hidden") {
    return null;
  }

  const isSending = phase === "sending";
  const title = isSending
    ? t("Sending…", "ပို့နေသည်…")
    : t("Sent", "ပို့ပြီးပါပြီ");
  const subtitle = isSending
    ? t("Your message is on the way.", "သင့်စာကို ပို့နေပါသည်။")
    : t("It will appear in their feed.", "သူတို့၏ feed တွင် ပေါ်လာပါမည်။");

  return (
    <div
      className="send-status-overlay fixed inset-0 z-[100] flex items-center justify-center p-8 sm:p-10"
      role="status"
      aria-live="polite"
      aria-busy={isSending}
    >
      <div className="send-status-overlay__backdrop absolute inset-0 bg-background/45 backdrop-blur-[3px]" />

      <div className="send-status-overlay__panel relative flex w-full max-w-[20rem] flex-col items-center gap-8 rounded-2xl border border-border/70 bg-card px-8 py-9 shadow-sm ring-1 ring-black/[0.04] dark:ring-white/[0.06] sm:max-w-[21rem] sm:px-10 sm:py-10">
        <EnvelopeRevealVisual
          phase={isSending ? "sending" : "success"}
          purpose="send"
          checkKey={successPlayId}
        />

        <div className="w-full space-y-2.5 text-center">
          <Small
            className={
              isSending
                ? "block leading-snug text-foreground"
                : "block leading-snug font-semibold text-emerald-700 dark:text-emerald-400"
            }
          >
            {title}
          </Small>
          <Muted className="mx-auto block max-w-[16.5rem] text-xs leading-[1.55]">
            {subtitle}
          </Muted>
        </div>
      </div>
    </div>
  );
}
