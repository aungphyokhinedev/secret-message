"use client";

import { cn } from "@/lib/utils";

export type EnvelopeRevealPurpose = "send" | "read";

type EnvelopeRevealVisualProps = {
  phase: "sending" | "success";
  purpose: EnvelopeRevealPurpose;
  /** For `read`: text on the letter; for `send`: ignored (checkmark is shown on success). */
  messageText?: string;
  /** Bumps checkmark replay for send flow. */
  checkKey?: number;
  className?: string;
};

export function EnvelopeRevealVisual({
  phase,
  purpose,
  messageText = "",
  checkKey = 0,
  className,
}: EnvelopeRevealVisualProps) {
  const isSending = phase === "sending";

  return (
    <div
      className={cn(
        "send-status-envelope-scene relative flex h-[10.25rem] w-[12rem] items-center justify-center sm:h-[11.25rem] sm:w-[13.5rem]",
        isSending ? "send-status-envelope-scene--sending" : "send-status-envelope-scene--success",
        className,
      )}
      aria-hidden
    >
      <svg
        className="send-status-envelope-svg h-full w-full overflow-visible"
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 42h96v48H12V42z"
          className="fill-muted/90 stroke-border/80 dark:fill-muted/50"
          strokeWidth="1"
        />

        {/* Top flap first so it sits behind the paper; sides + bottom stay in front. */}
        <g className="send-status-envelope__flap-group">
          <path
            d="M12 42L60 18L108 42H12z"
            className="fill-muted stroke-border/80 dark:fill-muted/60"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </g>

        <g className="send-status-envelope__paper">
          <rect
            x="26"
            y="46"
            width="68"
            height="40"
            rx="2"
            className="fill-card stroke-border/70"
            strokeWidth="1"
          />

          {purpose === "send" ? (
            <path
              key={checkKey}
              d="M48 64l6 6 14-14"
              className="send-status-envelope__check stroke-emerald-600 dark:stroke-emerald-400"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : (
            <foreignObject x="27" y="48" width="66" height="36">
              <div
                className="send-status-envelope__paper-message-wrap h-full overflow-y-auto overflow-x-hidden px-1.5 py-1 text-left [scrollbar-width:thin]"
              >
                <p className="text-[9px] leading-[1.35] text-foreground [text-wrap:pretty] sm:text-[10px] sm:leading-snug">
                  {messageText}
                </p>
              </div>
            </foreignObject>
          )}
        </g>

        <path
          d="M12 42L60 68 12 88V42z"
          className="fill-muted/70 stroke-border/60 dark:fill-muted/40"
          strokeWidth="0.75"
        />
        <path
          d="M108 42L60 68 108 88V42z"
          className="fill-muted/70 stroke-border/60 dark:fill-muted/40"
          strokeWidth="0.75"
        />

        <path
          d="M12 88h96L60 68 12 88z"
          className="fill-muted/80 stroke-border/70 dark:fill-muted/45"
          strokeWidth="0.75"
        />
      </svg>
    </div>
  );
}
