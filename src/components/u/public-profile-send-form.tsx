"use client";

import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Cookie,
  Droplets,
  Flower2,
  Frown,
  type LucideIcon,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  sendInteractionAction,
  type SendInteractionState,
} from "@/app/u/[username]/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { SendStatusOverlay } from "@/components/u/send-status-overlay";
import { PUBLIC_MESSAGE_MAX_CHARS } from "@/lib/message-limits";
import { cn } from "@/lib/utils";

type PublicProfileSendFormProps = {
  receiverUsername: string;
  /** When the viewer is the profile owner, hide the send UI. */
  isSelf: boolean;
  dailyLimit?: number;
  dailyUsed?: number;
};

const OPTIONS: {
  value: "water_splash" | "black_soot" | "food" | "flower";
  label: string;
  hint: string;
  icon: LucideIcon;
}[] = [
  { value: "water_splash", label: "Water splash", hint: "ရေပက်", icon: Droplets },
  { value: "black_soot", label: "Black soot", hint: "အိုးမဲသုတ်", icon: Frown },
  { value: "food", label: "Sweet (mont lone)", hint: "မုန့်လုံး", icon: Cookie },
  { value: "flower", label: "Flower (padauk)", hint: "ပိတောက်ပန်း", icon: Flower2 },
];

export function PublicProfileSendForm({
  receiverUsername,
  isSelf,
  dailyLimit = 50,
  dailyUsed = 0,
}: PublicProfileSendFormProps) {
  const { t } = useUiLanguage();
  const [state, formAction, pending] = useActionState<SendInteractionState, FormData>(
    sendInteractionAction,
    null,
  );

  const [sendOverlayPhase, setSendOverlayPhase] = useState<"hidden" | "sending" | "success">(
    "hidden",
  );
  const [sendSuccessPlayId, setSendSuccessPlayId] = useState(0);
  const [usedCount, setUsedCount] = useState(dailyUsed);
  const [messageText, setMessageText] = useState("");
  const remaining = Math.max(0, dailyLimit - usedCount);

  useEffect(() => {
    setUsedCount(dailyUsed);
  }, [dailyUsed, dailyLimit]);

  useEffect(() => {
    if (pending) {
      setSendOverlayPhase("sending");
    }
  }, [pending]);

  useEffect(() => {
    if (!pending && state?.message && !state?.error) {
      setSendOverlayPhase("success");
      setSendSuccessPlayId((n) => n + 1);
      setUsedCount((n) => Math.min(dailyLimit, n + 1));
      window.dispatchEvent(new CustomEvent("secretgift:public-profile-message-sent"));
    }
  }, [pending, state, dailyLimit]);

  useEffect(() => {
    if (!pending && state?.error) {
      setSendOverlayPhase("hidden");
    }
  }, [pending, state?.error]);

  useEffect(() => {
    if (sendOverlayPhase !== "success") {
      return;
    }
    const timer = window.setTimeout(() => {
      setSendOverlayPhase((p) => (p === "success" ? "hidden" : p));
    }, 3200);
    return () => window.clearTimeout(timer);
  }, [sendOverlayPhase]);

  if (isSelf) {
    return (
      <Card className="border-amber-500/25 bg-amber-500/5 py-3 shadow-none ring-0">
        <CardContent className="space-y-4 py-0 text-left">
          <p className="text-sm leading-relaxed text-foreground">
            {t(
              "This is your public link. Share it with friends.",
              "ဤ link သည် သင့် public link ဖြစ်ပါသည်။ သူငယ်ချင်းများထံ မျှဝေပါ။",
            )}
          </p>
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 w-full rounded-lg text-sm font-semibold",
            )}
          >
            {t("Go back to dashboard", "Dashboard သို့ ပြန်ရန်")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <form className="relative space-y-7 text-left" action={formAction}>
      <SendStatusOverlay
        phase={sendOverlayPhase}
        successPlayId={sendSuccessPlayId}
      />

      <input type="hidden" name="receiver_username" value={receiverUsername} />

      <fieldset className="space-y-4">
        <p className="rounded-xl bg-muted/40 px-4 py-3 text-xs leading-relaxed text-muted-foreground ring-1 ring-border/50">
          {t(
            `Daily limit: ${usedCount}/${dailyLimit} used (${remaining} remaining). Free: 50/day · Premium: 300/day.`,
            `နေ့စဉ်ကန့်သတ်ချက်: ${usedCount}/${dailyLimit} သုံးပြီး (${remaining} ကျန်). Free = 50/နေ့ · Premium = 300/နေ့။`,
          )}
        </p>
        <RadioGroup
          name="interaction_type"
          defaultValue="water_splash"
          required
          className="grid gap-2.5 sm:grid-cols-2"
        >
          {OPTIONS.map((opt) => {
            const id = `interaction-${opt.value}`;
            const Icon = opt.icon;
            return (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-border/80 bg-background px-4 py-3.5 transition-colors",
                  "focus-within:ring-2 focus-within:ring-ring/45 focus-within:ring-offset-2 focus-within:ring-offset-background",
                  "hover:border-border hover:bg-muted/30",
                  "has-[[data-slot=radio-group-item][data-checked]]:border-primary has-[[data-slot=radio-group-item][data-checked]]:bg-accent/35",
                  "has-[[data-slot=radio-group-item][data-checked]]:[&_.gift-option-icon]:border-primary/40",
                  "has-[[data-slot=radio-group-item][data-checked]]:[&_.gift-option-icon]:bg-primary/10",
                  "has-[[data-slot=radio-group-item][data-checked]]:[&_.gift-option-icon]:text-primary",
                )}
              >
                <RadioGroupItem value={opt.value} id={id} className="sr-only" />
                <span
                  className="gift-option-icon inline-flex size-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40 text-muted-foreground transition-colors"
                  aria-hidden
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug text-foreground">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{opt.hint}</span>
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2.5">
        <div className="flex items-end justify-between gap-2">
          <Label
            htmlFor="public-send-message"
            className="text-sm font-medium leading-none text-foreground"
          >
            {t("Message", "စာတို")}
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">
            {messageText.length}/{PUBLIC_MESSAGE_MAX_CHARS}
          </span>
        </div>
        <Textarea
          id="public-send-message"
          name="message"
          rows={3}
          maxLength={PUBLIC_MESSAGE_MAX_CHARS}
          required
          value={messageText}
          onChange={(e) =>
            setMessageText(e.target.value.slice(0, PUBLIC_MESSAGE_MAX_CHARS))
          }
          placeholder={t("Write your message to this receiver...", "လက်ခံသူအတွက် စာကိုရေးပါ...")}
          className="min-h-[4.5rem] resize-y text-[15px] leading-relaxed"
        />
      </div>

      {state?.error ? (
        <Alert variant="destructive" className="items-start">
          <AlertCircle className="size-4 shrink-0" aria-hidden />
          <AlertTitle className="text-sm leading-snug">
            {t("Could not send", "ပို့မရပါ")}
          </AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state?.message && sendOverlayPhase === "hidden" ? (
        <Alert
          className={cn(
            "items-start border-emerald-500/35 bg-emerald-500/10 text-emerald-950",
            "dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-50",
          )}
        >
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
          <AlertTitle className="text-sm leading-snug text-emerald-900 dark:text-emerald-50">
            {t("Sent", "ပို့ပြီးပါပြီ")}
          </AlertTitle>
          <AlertDescription className="text-emerald-900/90 dark:text-emerald-100/95">
            {state.message}
          </AlertDescription>
        </Alert>
      ) : null}

      <Button
        type="submit"
        disabled={pending || remaining <= 0}
        className="h-11 w-full rounded-lg text-base font-semibold shadow-sm"
        size="lg"
      >
        {pending ? t("Sending…", "ပို့နေသည်…") : t("Send", "ပို့မည်")}
      </Button>
    </form>
  );
}
