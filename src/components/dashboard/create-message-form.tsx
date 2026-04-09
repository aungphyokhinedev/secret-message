"use client";

import { FormEvent, useState } from "react";

import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";
import { formatSupabasePostgrestError } from "@/lib/supabase-postgrest-error";
import type { GiftType } from "@/types/app";
import type { Json } from "@/types/database";

const defaultGiftType: GiftType = "coupon";

export function CreateMessageForm() {
  const supabase = useSupabaseBrowser();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");
  const [unlockAt, setUnlockAt] = useState("");
  const [giftType, setGiftType] = useState<GiftType>(defaultGiftType);
  const [giftPayload, setGiftPayload] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Please sign in again to create a message.");
      setLoading(false);
      return;
    }

    const { data: insertedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_email: recipientEmail,
        encrypted_content: message,
        unlock_at: unlockAt || null,
      })
      .select("id")
      .single();

    if (messageError || !insertedMessage) {
      setError(
        formatSupabasePostgrestError(messageError?.message ?? "Could not create message."),
      );
      setLoading(false);
      return;
    }

    if (giftPayload.trim()) {
      let payload: Json = { value: giftPayload };

      try {
        payload = JSON.parse(giftPayload) as Json;
      } catch {
        payload = { value: giftPayload };
      }

      const { error: giftError } = await supabase.from("gifts").insert({
        message_id: insertedMessage.id,
        gift_type: giftType,
        gift_payload: payload,
      });

      if (giftError) {
        setError(formatSupabasePostgrestError(giftError.message));
        setLoading(false);
        return;
      }
    }

    setSuccess("Message created successfully.");
    setRecipientEmail("");
    setMessage("");
    setUnlockAt("");
    setGiftType(defaultGiftType);
    setGiftPayload("");
    setLoading(false);
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
      <h2 className="text-xl font-semibold">Create a secret message</h2>
      <p className="mt-1 text-sm text-slate-300">
        You can include an optional gift payload as text or JSON.
      </p>

      <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-slate-200">Recipient email</span>
          <input
            type="email"
            required
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-200">Unlock at (optional)</span>
          <input
            type="datetime-local"
            value={unlockAt}
            onChange={(event) => setUnlockAt(event.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-200">Secret message</span>
          <textarea
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="h-28 w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
            placeholder="Write your message"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-200">Gift type</span>
          <select
            value={giftType}
            onChange={(event) => setGiftType(event.target.value as GiftType)}
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
          >
            <option value="coupon">Coupon</option>
            <option value="video">Video</option>
            <option value="voice">Voice</option>
            <option value="image">Image</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-200">Gift payload (optional)</span>
          <input
            value={giftPayload}
            onChange={(event) => setGiftPayload(event.target.value)}
            className="w-full rounded-lg border border-white/15 bg-black/20 px-3 py-2 outline-none ring-cyan-300 transition focus:ring"
            placeholder='{"coupon":"NEWYEAR20"} or plain text'
          />
        </label>

        <div className="md:col-span-2">
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Message"}
        </button>
      </form>
    </section>
  );
}
