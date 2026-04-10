"use client";

import { Card, CardContent } from "@/components/ui/card";

type SendStatusOverlayProps = {
  phase: "hidden" | "sending" | "success";
  sendingLabel: string;
  successLabel: string;
  /** Increment to replay the success checkmark draw animation on each send. */
  successPlayId: number;
};

export function SendStatusOverlay({
  phase,
  sendingLabel,
  successLabel,
  successPlayId,
}: SendStatusOverlayProps) {
  if (phase === "hidden") {
    return null;
  }

  const isSending = phase === "sending";

  return (
    <div
      className="send-status-overlay fixed inset-0 z-[100] flex items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-busy={isSending}
    >
      <div className="send-status-overlay__backdrop absolute inset-0 bg-background/75 backdrop-blur-sm" />

      <div className="relative flex max-w-sm flex-col items-center gap-4">
        <div
          className={[
            "send-status-overlay__circle relative flex h-36 w-36 items-center justify-center rounded-full sm:h-40 sm:w-40",
            isSending ? "send-status-overlay__circle--sending" : "send-status-overlay__circle--success",
          ].join(" ")}
        >
          <span className="send-status-overlay__ring-outer absolute inset-0 rounded-full p-[3px]" aria-hidden>
            <span className="send-status-overlay__ring-gradient block h-full w-full rounded-full" />
          </span>

          <span
            className="absolute inset-[3px] z-[1] rounded-full bg-card shadow-xl ring-1 ring-border"
            aria-hidden
          />

          <div className="absolute inset-[3px] z-[2]">
            <div
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out",
                isSending ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-75",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                className="send-status-overlay__send-icon h-16 w-16 text-primary sm:h-[4.5rem] sm:w-[4.5rem]"
                aria-hidden
              >
                <path
                  fill="currentColor"
                  d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"
                />
              </svg>
            </div>

            <div
              key={successPlayId}
              className={[
                "absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out",
                isSending ? "pointer-events-none opacity-0 scale-75" : "opacity-100 scale-100",
              ].join(" ")}
            >
              <svg
                viewBox="0 0 24 24"
                className="send-status-overlay__success-icon h-16 w-16 text-emerald-600 sm:h-[4.5rem] sm:w-[4.5rem] dark:text-emerald-400"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.6" />
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 12.5 10.5 15 16 9"
                  className="send-status-overlay__check-stroke"
                />
              </svg>
            </div>
          </div>
        </div>

        <Card className="w-full border shadow-lg">
          <CardContent className="pt-6 pb-6 text-center">
            <p className="text-sm font-medium text-foreground sm:text-base">
              {isSending ? sendingLabel : successLabel}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
