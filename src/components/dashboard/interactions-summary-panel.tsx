"use client";

import { useMemo, useRef, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { InteractionStageCard } from "@/components/dashboard/interaction-stage-card";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
import { useSupabaseBrowser } from "@/components/providers/supabase-browser-provider";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import type { Database } from "@/types/database";

type InteractionRow = Database["public"]["Views"]["interactions_feed"]["Row"];
type InteractionType = Database["public"]["Enums"]["interaction_type"];

const TYPE_META: Record<InteractionType, { label: string }> = {
  water_splash: { label: "Water splash" },
  black_soot: { label: "Black soot" },
  food: { label: "Food (Mont Lone Yay Paw)" },
  flower: { label: "Flower (Padauk Pann)" },
};

const ALL_TYPES: InteractionType[] = ["water_splash", "black_soot", "food", "flower"];
const PAGE_SIZE = 6;
const AVATAR_BUCKET = "avatars";

function extFromName(name: string) {
  const ext = name.split(".").pop()?.toLowerCase().trim();
  return ext && ext.length <= 5 ? ext : "png";
}

type InteractionsSummaryPanelProps = {
  items: InteractionRow[];
  senderById: Map<string, { username: string; avatar_url: string | null }>;
  currentUsername: string;
  currentAvatarUrl: string | null;
  notice?: string | null;
};

export function InteractionsSummaryPanel({
  items,
  senderById,
  currentUsername,
  currentAvatarUrl,
  notice,
}: InteractionsSummaryPanelProps) {
  const { t } = useUiLanguage();
  const supabase = useSupabaseBrowser();
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarStatus, setAvatarStatus] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [pageByType, setPageByType] = useState<Record<InteractionType, number>>({
    water_splash: 1,
    black_soot: 1,
    food: 1,
    flower: 1,
  });

  const counts = useMemo(() => {
    const c: Record<InteractionType, number> = {
      water_splash: 0,
      black_soot: 0,
      food: 0,
      flower: 0,
    };
    for (const row of items) c[row.type] += 1;
    return c;
  }, [items]);

  const selectedItems = useMemo(
    () => (selectedType ? items.filter((row) => row.type === selectedType) : []),
    [items, selectedType],
  );

  const currentPage = selectedType ? pageByType[selectedType] : 1;
  const totalPages = Math.max(1, Math.ceil(selectedItems.length / PAGE_SIZE));
  const pagedItems = selectedItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedInteraction =
    selectedItems.find((row) => row.id === selectedInteractionId) ?? null;

  function openType(type: InteractionType) {
    setSelectedType(type);
    setSelectedInteractionId(null);
    setPageByType((prev) => ({ ...prev, [type]: 1 }));
  }

  function changePage(next: number) {
    if (!selectedType) return;
    const bounded = Math.min(totalPages, Math.max(1, next));
    setPageByType((prev) => ({ ...prev, [selectedType]: bounded }));
  }

  function openSharePanel() {
    window.dispatchEvent(new Event("secretgift:open-share-panel"));
  }

  async function onSelectAvatar(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setAvatarError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Image must be 5MB or smaller.");
      return;
    }

    setAvatarPending(true);
    setAvatarStatus(null);
    setAvatarError(null);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setAvatarError("Sign in again to upload your avatar.");
        return;
      }

      const ext = extFromName(file.name);
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (uploadError) {
        setAvatarError(
          `Upload failed: ${uploadError.message}. Ensure storage bucket "${AVATAR_BUCKET}" exists and allows authenticated uploads.`,
        );
        return;
      }

      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      const publicUrl = data.publicUrl;
      if (!publicUrl) {
        setAvatarError("Could not create avatar URL.");
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
      if (profileError) {
        setAvatarError(profileError.message);
        return;
      }

      setAvatarUrl(publicUrl);
      setAvatarStatus("Avatar updated.");
    } finally {
      setAvatarPending(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  return (
    <section className="mobile-glass-card rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{t("Received interaction summary", "လက်ခံရရှိမှု အကျဉ်းချုပ်")}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {t("Tap a type to view full messages with pagination.", "Type တစ်ခုရွေးပြီး စာရင်းအသေးစိတ် ကြည့်နိုင်သည်။")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-white/90 px-3 py-2">
          <button
            type="button"
            disabled={avatarPending}
            onClick={() => avatarInputRef.current?.click()}
            className="rounded-full transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Upload avatar"
            title={t("Click avatar to upload photo", "Avatar ကိုနှိပ်ပြီး ဓာတ်ပုံတင်ရန်")}
          >
            <Avatar src={avatarUrl} size={36} className="h-9 w-9" />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onSelectAvatar(e.target.files?.[0] ?? null)}
            disabled={avatarPending}
          />
          <span className="text-sm text-slate-700">@{currentUsername}</span>
          <button
            type="button"
            onClick={openSharePanel}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-white text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
            title={t("Open profile share panel", "Profile share panel ဖွင့်ရန်")}
            aria-label={t("Open profile share panel", "Profile share panel ဖွင့်ရန်")}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                fill="currentColor"
                d="M18 16a3 3 0 0 0-2.4 1.2l-6.9-3.45a3.33 3.33 0 0 0 0-1.5L15.6 8.8A3 3 0 1 0 15 7a2.8 2.8 0 0 0 .06.58l-6.9 3.45a3 3 0 1 0 0 1.94l6.9 3.45A2.8 2.8 0 0 0 15 17a3 3 0 1 0 3-1Z"
              />
            </svg>
          </button>
          <SignOutButton />
        </div>
      </div>
      {avatarError ? <p className="mt-2 text-xs text-rose-500">{avatarError}</p> : null}
      {avatarStatus ? <p className="mt-2 text-xs text-emerald-600">{t("Avatar updated.", "Avatar ပြောင်းလဲပြီးပါပြီ။")}</p> : null}

      {notice ? (
        <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
          {notice}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {ALL_TYPES.map((type) => {
          const active = selectedType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => openType(type)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                active
                  ? "border-indigo-300 bg-indigo-50 shadow-sm"
                  : "border-indigo-100 bg-white hover:border-indigo-200"
              }`}
            >
              <p className="mt-1 text-sm font-medium text-slate-800">{TYPE_META[type].label}</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{counts[type]}</p>
            </button>
          );
        })}
      </div>

      {!selectedType ? (
        <p className="mt-4 text-sm text-slate-600">{t("Select an interaction type to see received details.", "အသေးစိတ်ကြည့်ရန် interaction type ကိုရွေးပါ။")}</p>
      ) : pagedItems.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{t("No received interactions for this type yet.", "ဤ type အတွက် လက်ခံရရှိမှု မရှိသေးပါ။")}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {selectedType && selectedInteraction ? (
            <InteractionStageCard
              type={selectedType}
              open
              onClose={() => setSelectedInteractionId(null)}
              receiverUsername={currentUsername}
              senderLabel={
                selectedInteraction.sender_id && senderById.has(selectedInteraction.sender_id)
                  ? `@${senderById.get(selectedInteraction.sender_id)!.username}`
                  : "Someone"
              }
              senderAvatarUrl={
                selectedInteraction.sender_id && senderById.has(selectedInteraction.sender_id)
                  ? senderById.get(selectedInteraction.sender_id)!.avatar_url
                  : null
              }
              message={selectedInteraction.message ?? ""}
            />
          ) : null}

          {pagedItems.map((row) => {
            const sender =
              row.sender_id && senderById.has(row.sender_id) ? senderById.get(row.sender_id)! : null;
            const who = sender ? `@${sender.username}` : "Someone";
            return (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedInteractionId(row.id)}
                className="w-full rounded-2xl border border-indigo-100 bg-white p-4 text-left transition hover:border-indigo-200"
              >
                <div className="flex items-center gap-2 text-xs text-indigo-500">
                  <Avatar src={sender?.avatar_url ?? null} size={28} className="h-7 w-7" />
                  <span className="font-medium text-slate-800">{who}</span>
                  <span className="text-slate-500">·</span>
                  <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
                </div>
                <p className="mt-2 text-xs text-orange-500">{t("Click to open animation popup", "Animation popup ဖွင့်ရန် နှိပ်ပါ")}</p>
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">
              {t("Page", "စာမျက်နှာ")} {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-white text-slate-700 disabled:opacity-50"
                aria-label={t("Previous page", "အရင်စာမျက်နှာ")}
                title={t("Previous page", "အရင်စာမျက်နှာ")}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59Z"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-200 bg-white text-slate-700 disabled:opacity-50"
                aria-label={t("Next page", "နောက်စာမျက်နှာ")}
                title={t("Next page", "နောက်စာမျက်နှာ")}
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                  <path
                    fill="currentColor"
                    d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12l-4.58 4.59Z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
