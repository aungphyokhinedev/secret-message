"use client";

import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
        <div className="text-sm">
          <Label htmlFor="recipient-email" className="mb-1 block text-slate-200">
            Recipient email
          </Label>
          <Input
            id="recipient-email"
            type="email"
            required
            value={recipientEmail}
            onChange={(event) => setRecipientEmail(event.target.value)}
            className="h-auto border-white/15 bg-black/20 py-2 ring-cyan-300 focus-visible:ring"
          />
        </div>

        <div className="text-sm">
          <Label htmlFor="unlock-at" className="mb-1 block text-slate-200">
            Unlock at (optional)
          </Label>
          <Input
            id="unlock-at"
            type="datetime-local"
            value={unlockAt}
            onChange={(event) => setUnlockAt(event.target.value)}
            className="h-auto border-white/15 bg-black/20 py-2 ring-cyan-300 focus-visible:ring"
          />
        </div>

        <div className="text-sm md:col-span-2">
          <Label htmlFor="secret-message" className="mb-1 block text-slate-200">
            Secret message
          </Label>
          <Textarea
            id="secret-message"
            required
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-28 border-white/15 bg-black/20 ring-cyan-300 focus-visible:ring"
            placeholder="Write your message"
          />
        </div>

        <div className="text-sm">
          <Label className="mb-1 block text-slate-200">Gift type</Label>
          <Select
            value={giftType}
            onValueChange={(v) => setGiftType(v as GiftType)}
          >
            <SelectTrigger className="h-auto w-full border-white/15 bg-black/20 py-2 ring-cyan-300 focus-visible:ring">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="coupon">Coupon</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="voice">Voice</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-sm">
          <Label htmlFor="gift-payload" className="mb-1 block text-slate-200">
            Gift payload (optional)
          </Label>
          <Input
            id="gift-payload"
            value={giftPayload}
            onChange={(event) => setGiftPayload(event.target.value)}
            className="h-auto border-white/15 bg-black/20 py-2 ring-cyan-300 focus-visible:ring"
            placeholder='{"coupon":"NEWYEAR20"} or plain text'
          />
        </div>

        <div className="md:col-span-2">
          {error ? <p className="text-sm text-rose-300">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-300">{success}</p> : null}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Message"}
        </Button>
      </form>
    </section>
  );
}
