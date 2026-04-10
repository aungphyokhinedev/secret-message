"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  sendInteractionAction,
  type SendInteractionState,
} from "@/app/u/[username]/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { SendStatusOverlay } from "@/components/u/send-status-overlay";
import { cn } from "@/lib/utils";

type PublicProfileSendFormProps = {
  receiverUsername: string;
  /** When the viewer is the profile owner, hide the send UI. */
  isSelf: boolean;
  dailyLimit?: number;
  dailyUsed?: number;
};

const OPTIONS: { value: "water_splash" | "black_soot" | "food" | "flower"; label: string; hint: string }[] =
  [
    { value: "water_splash", label: "Water splash", hint: "ရေပက်" },
    { value: "black_soot", label: "Black soot", hint: "အိုးမဲသုတ်" },
    { value: "food", label: "Sweet (mont lone)", hint: "မုန့်လုံး" },
    { value: "flower", label: "Flower (padauk)", hint: "ပိတောက်ပန်း" },
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
        <CardContent className="py-0 text-left text-xs leading-relaxed text-foreground">
          {t(
            "This is your public link. Share it so friends can send splashes and gifts. You will see them on your dashboard.",
            "ဤ link သည် သင့် public link ဖြစ်ပါသည်။ သူငယ်ချင်းများထံ မျှဝေပြီး splash နှင့် gift များပို့ခိုင်းနိုင်သည်။ Dashboard တွင် ကြည့်နိုင်ပါသည်။",
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <form className="relative space-y-6 text-left" action={formAction}>
      <SendStatusOverlay
        phase={sendOverlayPhase}
        successPlayId={sendSuccessPlayId}
        sendingLabel={t("Sending your gift…", "လက်ဆောင်ပို့နေသည်…")}
        successLabel={t("Sent! They will see it on their home feed.", "ပို့ပြီးပါပြီ။ သူတို့ဘက်တွင် မြင်ရပါမည်။")}
      />

      <input type="hidden" name="receiver_username" value={receiverUsername} />

      <fieldset className="space-y-3">
        <legend className="font-heading text-sm font-medium text-foreground">
          {t("Choose one action or gift", "Action သို့ Gift တစ်ခုရွေးပါ")}
        </legend>
        <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
          {t(
            `Daily limit: ${usedCount}/${dailyLimit} used (${remaining} remaining). Free users: 50/day, premium users: 300/day.`,
            `နေ့စဉ်ကန့်သတ်ချက်: ${usedCount}/${dailyLimit} သုံးပြီး (${remaining} ကျန်). Free = 50/နေ့, Premium = 300/နေ့။`,
          )}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Actions: Water splash / Black soot. Gifts: Food (Mont Lone Yay Paw) / Flower (Padauk
          Pann).
        </p>
        <RadioGroup
          name="interaction_type"
          defaultValue="water_splash"
          required
          className="grid gap-2 sm:grid-cols-2"
        >
          {OPTIONS.map((opt) => {
            const id = `interaction-${opt.value}`;
            return (
              <label
                key={opt.value}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-background px-3 py-3 transition-colors",
                  "hover:bg-muted/50",
                  "has-[[data-slot=radio-group-item][data-checked]]:border-primary has-[[data-slot=radio-group-item][data-checked]]:bg-accent/40",
                )}
              >
                <RadioGroupItem value={opt.value} id={id} className="mt-1" />
                <span>
                  <span className="block text-sm font-medium leading-tight text-foreground">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">{opt.hint}</span>
                </span>
              </label>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="space-y-2">
        <Label
          htmlFor="public-send-message"
          className="text-sm font-medium text-foreground"
        >
          {t("Message", "စာတို")}
        </Label>
        <Textarea
          id="public-send-message"
          name="message"
          rows={3}
          maxLength={2000}
          required
          placeholder={t("Write your message to this receiver...", "လက်ခံသူအတွက် စာကိုရေးပါ...")}
          className="min-h-[5rem] resize-y"
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

      <Separator />

      <Button
        type="submit"
        disabled={pending || remaining <= 0}
        className="w-full rounded-lg"
        size="lg"
      >
        {pending ? t("Sending…", "ပို့နေသည်…") : t("Send", "ပို့မည်")}
      </Button>
    </form>
  );
}
