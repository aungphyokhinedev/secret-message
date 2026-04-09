"use client";

import { useActionState } from "react";

import {
  sendInteractionAction,
  type SendInteractionState,
} from "@/app/u/[username]/actions";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type PublicProfileSendFormProps = {
  receiverUsername: string;
  /** When the viewer is the profile owner, hide the send UI. */
  isSelf: boolean;
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
}: PublicProfileSendFormProps) {
  const { t } = useUiLanguage();
  const [state, formAction, pending] = useActionState<SendInteractionState, FormData>(
    sendInteractionAction,
    null,
  );

  if (isSelf) {
    return (
      <p className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
        {t(
          "This is your public link. Share it so friends can send splashes and gifts. You will see them on your dashboard.",
          "ဤ link သည် သင့် public link ဖြစ်ပါသည်။ သူငယ်ချင်းများထံ မျှဝေပြီး splash နှင့် gift များပို့ခိုင်းနိုင်သည်။ Dashboard တွင် ကြည့်နိုင်ပါသည်။",
        )}
      </p>
    );
  }

  return (
    <form className="mt-8 space-y-5 text-left" action={formAction}>
      <input type="hidden" name="receiver_username" value={receiverUsername} />

      <fieldset>
        <legend className="text-sm font-medium text-slate-700">{t("Choose one action or gift", "Action သို့ Gift တစ်ခုရွေးပါ")}</legend>
        <p className="mt-1 text-xs text-slate-500">
          Actions: Water splash / Black soot. Gifts: Food (Mont Lone Yay Paw) / Flower (Padauk
          Pann).
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-indigo-100 bg-white px-3 py-3 transition hover:border-indigo-200 has-[:checked]:border-indigo-300 has-[:checked]:bg-indigo-50"
            >
              <input
                type="radio"
                name="interaction_type"
                value={opt.value}
                required
                className="mt-1 border-indigo-300 text-indigo-500 focus:ring-indigo-400"
              />
              <span>
                <span className="block text-sm font-medium text-slate-800">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-700">{t("Message", "စာတို")}</span>
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          required
          placeholder={t("Write your message to this receiver...", "လက်ခံသူအတွက် စာကိုရေးပါ...")}
          className="w-full resize-y rounded-xl border border-indigo-100 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-indigo-300 transition focus:ring"
        />
      </label>

      {state?.error ? <p className="text-sm text-rose-500">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-600">{state.message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t("Sending…", "ပို့နေသည်…") : t("Send", "ပို့မည်")}
      </button>
    </form>
  );
}
