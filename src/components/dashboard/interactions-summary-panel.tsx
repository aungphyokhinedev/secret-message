"use client";

import { useMemo, useState } from "react";

import { Avatar } from "@/components/common/avatar";
import { InteractionStageCard } from "@/components/dashboard/interaction-stage-card";
import type { Database } from "@/types/database";

type InteractionRow = Database["public"]["Views"]["interactions_feed"]["Row"];
type InteractionType = Database["public"]["Enums"]["interaction_type"];

const TYPE_META: Record<InteractionType, { label: string; icon: string }> = {
  water_splash: { label: "Water splash", icon: "💧" },
  black_soot: { label: "Black soot", icon: "🖤" },
  food: { label: "Food (Mont Lone Yay Paw)", icon: "🍡" },
  flower: { label: "Flower (Padauk Pann)", icon: "🌼" },
};

const ALL_TYPES: InteractionType[] = ["water_splash", "black_soot", "food", "flower"];
const PAGE_SIZE = 6;

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
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
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

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Received interaction summary</h2>
          <p className="mt-1 text-xs text-slate-400">
            Tap a type to view full messages with pagination.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <Avatar src={currentAvatarUrl} size={36} className="h-9 w-9" />
          <span className="text-sm text-slate-100">@{currentUsername}</span>
        </div>
      </div>

      {notice ? (
        <p className="mt-3 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
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
              className={`rounded-xl border px-3 py-3 text-left transition ${
                active
                  ? "border-cyan-400/70 bg-cyan-500/15"
                  : "border-white/10 bg-black/20 hover:border-cyan-400/40"
              }`}
            >
              <p className="text-xs text-slate-300">{TYPE_META[type].icon}</p>
              <p className="mt-1 text-sm font-medium text-white">{TYPE_META[type].label}</p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">{counts[type]}</p>
            </button>
          );
        })}
      </div>

      {!selectedType ? (
        <p className="mt-4 text-sm text-slate-300">Select an interaction type to see received details.</p>
      ) : pagedItems.length === 0 ? (
        <p className="mt-4 text-sm text-slate-300">No received interactions for this type yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {selectedType && selectedInteraction ? (
            <InteractionStageCard
              type={selectedType}
              open
              onClose={() => setSelectedInteractionId(null)}
              receiverUsername={currentUsername}
              receiverAvatarUrl={currentAvatarUrl}
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
              createdAt={selectedInteraction.created_at}
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
                className="w-full rounded-xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-cyan-300/45"
              >
                <div className="flex items-center gap-2 text-xs text-cyan-300">
                  <Avatar src={sender?.avatar_url ?? null} size={28} className="h-7 w-7" />
                  <span className="font-medium text-white">{who}</span>
                  <span className="text-slate-500">·</span>
                  <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
                </div>
                <p className="mt-2 text-sm text-slate-200">{row.message?.trim() || "No message text."}</p>
                <p className="mt-2 text-xs text-cyan-300/90">Click to open animation popup</p>
              </button>
            );
          })}

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-400">
              Page {currentPage} / {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-100 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
