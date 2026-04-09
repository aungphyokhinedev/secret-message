"use client";

import { useActionState } from "react";

import {
  sendInteractionAction,
  type SendInteractionState,
} from "@/app/u/[username]/actions";
import { Avatar } from "@/components/common/avatar";

type PublicProfileSendFormProps = {
  receiverUsername: string;
  receiverAvatarUrl: string | null;
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
  receiverAvatarUrl,
  isSelf,
}: PublicProfileSendFormProps) {
  const [state, formAction, pending] = useActionState<SendInteractionState, FormData>(
    sendInteractionAction,
    null,
  );

  if (isSelf) {
    return (
      <p className="mt-6 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        This is your public link. Share it so friends can send splashes and gifts. You will see them on
        your dashboard.
      </p>
    );
  }

  return (
    <form className="mt-8 space-y-5 text-left" action={formAction}>
      <input type="hidden" name="receiver_username" value={receiverUsername} />

      <section className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Sending To</p>
        <div className="mt-2 flex items-center gap-3">
          <Avatar src={receiverAvatarUrl} size={40} className="h-10 w-10" />
          <p className="text-sm text-slate-100">@{receiverUsername}</p>
        </div>
      </section>

      <fieldset>
        <legend className="text-sm font-medium text-slate-200">Choose one action or gift</legend>
        <p className="mt-1 text-xs text-slate-400">
          Actions: Water splash / Black soot. Gifts: Food (Mont Lone Yay Paw) / Flower (Padauk
          Pann).
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/25 px-3 py-3 transition hover:border-cyan-400/40 has-[:checked]:border-cyan-400/60 has-[:checked]:bg-cyan-500/10"
            >
              <input
                type="radio"
                name="interaction_type"
                value={opt.value}
                required
                className="mt-1 border-white/30 text-cyan-400 focus:ring-cyan-400"
              />
              <span>
                <span className="block text-sm font-medium text-white">{opt.label}</span>
                <span className="text-xs text-slate-400">{opt.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="mb-1 block text-slate-200">Message</span>
        <textarea
          name="message"
          rows={3}
          maxLength={2000}
          required
          placeholder="Write your message to this receiver..."
          className="w-full resize-y rounded-lg border border-white/15 bg-black/20 px-3 py-2 text-sm outline-none ring-cyan-300 transition focus:ring"
        />
      </label>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
