"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Cookie,
  Frown,
  Droplets,
  Flower2,
  Inbox,
  Mail,
  Plus,
  SendHorizontal,
  Share2,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import { Avatar } from "@/components/common/avatar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { InteractionStageCard } from "@/components/dashboard/interaction-stage-card";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Toggle } from "@/components/ui/toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Muted } from "@/components/ui/typography";
import {
  deleteSentInteractionAction,
  getUnreadReceivedCountAction,
  markInteractionReadAction,
} from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type InteractionRow = Database["public"]["Views"]["interactions_feed"]["Row"];
type InteractionType = Database["public"]["Enums"]["interaction_type"];

const TYPE_META: Record<InteractionType, { label: string; short: string }> = {
  water_splash: { label: "Water splash", short: "Water" },
  black_soot: { label: "Black soot", short: "Black soot" },
  food: { label: "Food (Mont Lone Yay Paw)", short: "Food" },
  flower: { label: "Flower (Padauk Pann)", short: "Flower" },
};

const TYPE_ICONS: Record<InteractionType, LucideIcon> = {
  water_splash: Droplets,
  black_soot: Frown,
  food: Cookie,
  flower: Flower2,
};

const ALL_TYPES: InteractionType[] = ["water_splash", "black_soot", "food", "flower"];
const PAGE_SIZE = 10;

/** Summary metric cards — per-type gradients (Thingyan palette). */
const TYPE_SUMMARY_STYLE: Record<
  InteractionType,
  {
    card: string;
    cardActive: string;
    title: string;
    count: string;
    iconMuted: string;
  }
> = {
  water_splash: {
    card: "border-sky-300/55 bg-gradient-to-br from-sky-100 via-cyan-50 to-indigo-100/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-sky-700/45 dark:from-sky-950/85 dark:via-cyan-950/55 dark:to-indigo-950/75 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    cardActive:
      "border-sky-400/90 ring-1 ring-sky-400/50 ring-offset-1 ring-offset-background sm:ring-2 sm:ring-offset-2 dark:border-sky-500/70 dark:ring-sky-400/45",
    title: "text-sky-900/85 dark:text-sky-100/95",
    count: "text-sky-950 drop-shadow-sm dark:text-sky-50",
    iconMuted: "text-sky-600/90 dark:text-sky-300/95",
  },
  black_soot: {
    card: "border-slate-300/60 bg-gradient-to-br from-slate-100 via-zinc-100 to-neutral-300/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-zinc-600/50 dark:from-slate-950/90 dark:via-zinc-950/75 dark:to-neutral-950/85 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
    cardActive:
      "border-violet-400/75 ring-1 ring-violet-500/45 ring-offset-1 ring-offset-background sm:ring-2 sm:ring-offset-2 dark:border-violet-500/55 dark:ring-violet-400/40",
    title: "text-slate-800/90 dark:text-zinc-100/95",
    count: "text-slate-950 drop-shadow-sm dark:text-zinc-50",
    iconMuted: "text-slate-600/90 dark:text-zinc-400/95",
  },
  food: {
    card: "border-amber-300/60 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-200/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-amber-700/45 dark:from-amber-950/88 dark:via-orange-950/65 dark:to-amber-900/80 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    cardActive:
      "border-amber-400/90 ring-1 ring-amber-400/48 ring-offset-1 ring-offset-background sm:ring-2 sm:ring-offset-2 dark:border-amber-500/65 dark:ring-amber-400/42",
    title: "text-amber-950/88 dark:text-amber-50/98",
    count: "text-amber-950 drop-shadow-sm dark:text-amber-50",
    iconMuted: "text-amber-700/90 dark:text-amber-300/95",
  },
  flower: {
    card: "border-fuchsia-300/50 bg-gradient-to-br from-fuchsia-100 via-pink-50 to-rose-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] dark:border-fuchsia-800/45 dark:from-fuchsia-950/82 dark:via-pink-950/60 dark:to-rose-950/78 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    cardActive:
      "border-fuchsia-400/85 ring-1 ring-fuchsia-500/45 ring-offset-1 ring-offset-background sm:ring-2 sm:ring-offset-2 dark:border-fuchsia-500/60 dark:ring-fuchsia-400/40",
    title: "text-rose-900/88 dark:text-pink-50/96",
    count: "text-rose-950 drop-shadow-sm dark:text-fuchsia-50",
    iconMuted: "text-fuchsia-700/90 dark:text-fuchsia-300/95",
  },
};

function formatInteractionTime(iso: string) {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}

export type DashboardClientProps = {
  items: InteractionRow[];
  sentItems: InteractionRow[];
  senderById: Record<string, { username: string; avatar_url: string | null }>;
  receiverById: Record<string, { username: string; avatar_url: string | null }>;
  currentUsername: string;
  userEmail: string;
  userAvatarUrl: string | null;
  currentIsPremium: boolean;
  currentDailyUsed: number;
  currentDailyLimit: number;
  /** Unread received messages (receiver_read_at is null); shown in header. */
  initialUnreadReceivedCount: number;
  notice?: string | null;
  sentNotice?: string | null;
};

export function DashboardClient({
  items,
  sentItems,
  senderById,
  receiverById,
  currentUsername,
  userEmail,
  userAvatarUrl,
  currentIsPremium,
  currentDailyUsed,
  currentDailyLimit,
  initialUnreadReceivedCount,
  notice,
  sentNotice,
}: DashboardClientProps) {
  const { t } = useUiLanguage();
  const router = useRouter();
  const [unreadReceivedCount, setUnreadReceivedCount] = useState(initialUnreadReceivedCount);
  const [feedTab, setFeedTab] = useState<"received" | "sent">("received");
  const [filterType, setFilterType] = useState<InteractionType | null>(null);
  const [listPage, setListPage] = useState(1);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteConfirmForId, setDeleteConfirmForId] = useState<string | null>(null);
  const [readInteractionIds, setReadInteractionIds] = useState<Set<string>>(new Set());

  const activeItems = feedTab === "received" ? items : sentItems;

  useEffect(() => {
    setUnreadReceivedCount(initialUnreadReceivedCount);
  }, [initialUnreadReceivedCount]);

  useEffect(() => {
    const tick = async () => {
      const result = await getUnreadReceivedCountAction();
      if (result.ok) {
        setUnreadReceivedCount(result.count);
      }
    };
    const intervalId = window.setInterval(tick, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

  /** Deep link from public profile header: /dashboard#dashboard-interaction-feed */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#dashboard-interaction-feed") return;
    setFeedTab("received");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.getElementById("dashboard-interaction-feed")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, []);

  useEffect(() => {
    setFilterType(null);
    setListPage(1);
    setSelectedInteractionId(null);
  }, [feedTab]);

  const counts = useMemo(() => {
    const c: Record<InteractionType, number> = {
      water_splash: 0,
      black_soot: 0,
      food: 0,
      flower: 0,
    };
    for (const row of activeItems) c[row.type] += 1;
    return c;
  }, [activeItems]);

  const typeFiltered = useMemo(() => {
    if (!filterType) return activeItems;
    return activeItems.filter((row) => row.type === filterType);
  }, [activeItems, filterType]);

  const totalPages = Math.max(1, Math.ceil(typeFiltered.length / PAGE_SIZE));

  useEffect(() => {
    setListPage((p) => Math.min(p, totalPages));
  }, [totalPages, filterType]);

  const pagedItems = typeFiltered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const selectedInteraction = typeFiltered.find((row) => row.id === selectedInteractionId) ?? null;

  const hasNoMessagesInTab = activeItems.length === 0;
  const activeNotice = feedTab === "received" ? notice : sentNotice;
  const rangeStart = typeFiltered.length === 0 ? 0 : (listPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(listPage * PAGE_SIZE, typeFiltered.length);

  function changePage(next: number) {
    setListPage(Math.min(totalPages, Math.max(1, next)));
  }

  function openInteraction(id: string) {
    setSelectedInteractionId(id);
    if (feedTab === "received") {
      const row = items.find((r) => r.id === id);
      const wasUnread = Boolean(
        row && !row.receiver_read_at && !readInteractionIds.has(id),
      );
      setReadInteractionIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      if (wasUnread) {
        setUnreadReceivedCount((c) => Math.max(0, c - 1));
      }
      void markInteractionReadAction(id);
    }
  }

  function scrollToInboxFeed() {
    setFeedTab("received");
    window.requestAnimationFrame(() => {
      document.getElementById("dashboard-interaction-feed")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openDeleteConfirm(interactionId: string) {
    setDeleteConfirmForId(interactionId);
  }

  async function executeConfirmedDelete() {
    const id = deleteConfirmForId;
    if (!id) return;

    setPendingDeleteId(id);
    try {
      const result = await deleteSentInteractionAction(id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      setDeleteConfirmForId(null);
      setSelectedInteractionId((prev) => (prev === id ? null : prev));
      router.refresh();
    } finally {
      setPendingDeleteId(null);
    }
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <DashboardHeader
        currentUsername={currentUsername}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
        isPremium={currentIsPremium}
        dailyUsed={currentDailyUsed}
        dailyLimit={currentDailyLimit}
        unreadReceivedCount={unreadReceivedCount}
        onInboxClick={scrollToInboxFeed}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-0">
          <div className="space-y-6 px-5 py-6 sm:px-6 sm:py-8">
          <div className="space-y-4 sm:space-y-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Online Thingyan
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.85rem]">
                {t("Interactions", "အပြန်အလှန်များ")}
              </h1>
              <Button
                type="button"
                className={cn(
                  "share-profile-open-btn--solid relative h-10 w-full shrink-0 gap-2 overflow-hidden rounded-lg px-4 sm:w-auto",
                )}
                onClick={() => window.dispatchEvent(new Event("secretgift:open-share-panel"))}
              >
                <span className="relative z-[1] inline-flex items-center gap-2">
                  <Plus className="share-profile-open-btn__icon size-4" aria-hidden />
                  {t("Share profile", "Profile မျှဝေရန်")}
                </span>
              </Button>
            </div>

            <Tabs
              value={feedTab}
              onValueChange={(v) => setFeedTab(v as "received" | "sent")}
              className="w-full min-w-0"
            >
              <TabsList
                variant="default"
                className="grid !h-auto min-h-12 w-full min-w-0 grid-cols-2 gap-1.5 rounded-lg border border-border/70 bg-muted/35 p-1 shadow-inner"
              >
                <TabsTrigger
                  value="received"
                  className={cn(
                    "relative gap-2 rounded-md px-3 py-2.5 text-xs font-semibold sm:min-h-11 sm:px-4 sm:text-sm",
                    "data-active:bg-card data-active:text-foreground data-active:shadow-sm",
                    "dark:data-active:bg-background/80",
                  )}
                >
                  <Inbox className="size-4 shrink-0 opacity-90 sm:size-[1.125rem]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {t("Received", "လက်ခံမှု")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums",
                      feedTab === "received"
                        ? "bg-primary/15 text-primary dark:bg-primary/25"
                        : "bg-background/60 text-muted-foreground dark:bg-background/20",
                    )}
                  >
                    {items.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="sent"
                  className={cn(
                    "relative gap-2 rounded-md px-3 py-2.5 text-xs font-semibold sm:min-h-11 sm:px-4 sm:text-sm",
                    "data-active:bg-card data-active:text-foreground data-active:shadow-sm",
                    "dark:data-active:bg-background/80",
                  )}
                >
                  <SendHorizontal className="size-4 shrink-0 opacity-90 sm:size-[1.125rem]" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {t("Sent", "ပို့မှု")}
                  </span>
                  <span
                    className={cn(
                      "inline-flex min-w-[1.75rem] shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.6875rem] font-semibold tabular-nums",
                      feedTab === "sent"
                        ? "bg-primary/15 text-primary dark:bg-primary/25"
                        : "bg-background/60 text-muted-foreground dark:bg-background/20",
                    )}
                  >
                    {sentItems.length}
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <p className="w-full text-sm leading-relaxed text-muted-foreground">
              {feedTab === "received"
                ? t(
                    "Here's what friends sent you for Thingyan. Tap a metric to filter by type.",
                    "သူငယ်ချင်းများ ပို့သော အပြန်အလှန်များ။ Type စစ်ရန် metric ကို နှိပ်ပါ။",
                  )
                : t(
                    "Your outgoing splashes, gifts, and messages. Tap a metric to filter by type.",
                    "သင်ပို့သော ရေပက်၊ လက်ဆောင်နှင့် စာများ။ Type စစ်ရန် metric ကို နှိပ်ပါ။",
                  )}
            </p>
          </div>

          <div className="space-y-5 sm:space-y-6">
            {activeNotice ? (
              <Card className="border-amber-500/25 bg-amber-500/5 py-2.5 shadow-none ring-0">
                <CardContent className="py-0 text-xs leading-relaxed text-foreground">
                  {activeNotice}
                </CardContent>
              </Card>
            ) : null}

            {hasNoMessagesInTab ? (
                <Card className="border-border bg-muted/40 shadow-none ring-0">
                  <CardHeader className="space-y-1.5 pb-3">
                    <CardTitle className="font-heading text-base">
                      {feedTab === "received"
                        ? t("No gifts or messages yet", "လက်ဆောင်နှင့် စာများ မရရှိသေးပါ")
                        : t("Nothing sent yet", "မည်သည့်အရာမျှ မပို့ရသေးပါ")}
                    </CardTitle>
                    <CardDescription className="text-xs leading-relaxed sm:text-sm">
                      {feedTab === "received"
                        ? t(
                            "Share your profile link so friends can open your page and send splashes, gifts, and messages.",
                            "သင့် profile link ကို မျှဝေပါ။ သူငယ်ချင်းများက ရေပက်၊ လက်ဆောင်နှင့် စာများ ပို့နိုင်ပါသည်။",
                          )
                        : t(
                            "Open a friend's profile link while signed in, choose a splash or gift, add a message, and send. Sent items will appear here.",
                            "သူငယ်ချင်း၏ profile လင့်ကို ဝင်ထားစဉ် ဖွင့်ပြီး ရေပက် သို့မဟုတ် လက်ဆောင်ရွေးကာ စာရေးပို့ပါ။ ပို့ထားသည်များ ဤနေရာတွင် ပေါ်လာပါမည်။",
                          )}
                    </CardDescription>
                  </CardHeader>
                  {feedTab === "received" ? (
                    <CardFooter className="border-0 bg-transparent pt-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.dispatchEvent(new Event("secretgift:open-share-panel"))}
                        className={cn(
                          "share-profile-open-btn--outline h-9 gap-1.5 rounded-lg border-2 font-medium",
                        )}
                      >
                        <Share2 className="h-4 w-4 shrink-0" aria-hidden />
                        {t("Share profile", "Profile မျှဝေရန်")}
                      </Button>
                    </CardFooter>
                  ) : null}
                </Card>
            ) : (
              <>
                <div
                  className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-2.5"
                  role="toolbar"
                  aria-label={t("Filter by interaction type", "Interaction အမျိုးအစားဖြင့် စစ်ပါ")}
                >
                    {ALL_TYPES.map((type) => {
                      const active = filterType === type;
                      const Icon = TYPE_ICONS[type];
                      const palette = TYPE_SUMMARY_STYLE[type];
                      return (
                        <Toggle
                          key={type}
                          type="button"
                          variant="outline"
                          size="default"
                          pressed={active}
                          onPressedChange={(next) => {
                            setFilterType(next ? type : null);
                            setSelectedInteractionId(null);
                            setListPage(1);
                          }}
                          className={cn(
                            "h-auto min-h-0 w-full min-w-0 border-0 bg-transparent p-0 font-normal shadow-none",
                            "hover:!bg-transparent aria-pressed:!bg-transparent data-[pressed]:!bg-transparent",
                            "focus-visible:z-[1] focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          )}
                          aria-label={TYPE_META[type].label}
                        >
                          <span
                            className={cn(
                              "flex w-full items-center gap-2 overflow-hidden rounded-lg border-2 border-transparent px-2.5 py-2 text-left transition-all duration-200 sm:gap-2.5 sm:px-3 sm:py-2.5",
                              "hover:shadow-md hover:brightness-[1.02] dark:hover:brightness-110",
                              palette.card,
                              active &&
                                cn("shadow-sm brightness-100 dark:brightness-100", palette.cardActive),
                            )}
                          >
                            <span className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
                              {active ? (
                                <span
                                  className={cn(
                                    "inline-flex size-7 shrink-0 items-center justify-center rounded-md border bg-background/90 shadow-sm backdrop-blur-sm sm:size-8",
                                    type === "water_splash" &&
                                      "border-sky-500/80 text-sky-600 dark:border-sky-400 dark:text-sky-300",
                                    type === "black_soot" &&
                                      "border-violet-600/80 text-violet-700 dark:border-violet-400 dark:text-violet-300",
                                    type === "food" &&
                                      "border-amber-600/80 text-amber-700 dark:border-amber-400 dark:text-amber-300",
                                    type === "flower" &&
                                      "border-fuchsia-600/80 text-fuchsia-700 dark:border-fuchsia-400 dark:text-fuchsia-300",
                                  )}
                                  aria-hidden
                                >
                                  <Check className="size-3.5" strokeWidth={2.5} />
                                </span>
                              ) : (
                                <span
                                  className={cn(
                                    "inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-black/5 bg-background/40 dark:border-white/10",
                                    palette.iconMuted,
                                  )}
                                  aria-hidden
                                >
                                  <Icon className="size-3.5 opacity-95 sm:size-4" />
                                </span>
                              )}
                              <span
                                className={cn(
                                  "min-w-0 truncate text-[0.6875rem] font-semibold leading-tight tracking-tight sm:text-xs",
                                  palette.title,
                                )}
                              >
                                {TYPE_META[type].short}
                              </span>
                            </span>
                            <span
                              className={cn(
                                "shrink-0 text-lg font-bold tabular-nums leading-none tracking-tight sm:text-xl",
                                palette.count,
                              )}
                            >
                              {counts[type]}
                            </span>
                          </span>
                        </Toggle>
                      );
                    })}
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <p className="text-base font-medium text-foreground">
                        {t("Interaction feed", "Interaction စာရင်း")}
                      </p>
                      <Muted className="text-sm sm:text-right">
                        {feedTab === "sent"
                          ? t(
                              "Click a row for details. Use delete to remove from your sent list.",
                              "အသေးစိတ် အတွက် အတန်းကို နှိပ်ပါ။ ပို့မှု စာရင်းမှ ဖျက်ရန် ဖျက်ခလုတ်သုံးပါ။",
                            )
                          : t(
                              "Open a row to reveal the gift and message — not shown in the list.",
                              "လက်ဆောင်နှင့် စာကို အတန်းကိုဖွင့်မှသာ မြင်ရပါမည်။ စာရင်းတွင် မပြပါ။",
                            )}
                      </Muted>
                    </div>

                {selectedInteraction ? (
                      <InteractionStageCard
                        type={selectedInteraction.type}
                        open
                        onClose={() => setSelectedInteractionId(null)}
                        receiverUsername={
                          feedTab === "sent" &&
                          selectedInteraction.receiver_id &&
                          receiverById[selectedInteraction.receiver_id]
                            ? receiverById[selectedInteraction.receiver_id].username
                            : currentUsername
                        }
                        peerEyebrow={
                          feedTab === "received"
                            ? t("Sender", "ပို့သူ")
                            : t("Recipient", "လက်ခံသူ")
                        }
                        senderLabel={
                          feedTab === "received"
                            ? selectedInteraction.sender_id && senderById[selectedInteraction.sender_id]
                              ? `@${senderById[selectedInteraction.sender_id].username}`
                              : t("Someone", "တစ်စုံတစ်ယောက်")
                            : selectedInteraction.receiver_id && receiverById[selectedInteraction.receiver_id]
                              ? `@${receiverById[selectedInteraction.receiver_id].username}`
                              : t("Someone", "တစ်စုံတစ်ယောက်")
                        }
                        senderAvatarUrl={
                          feedTab === "received"
                            ? selectedInteraction.sender_id && senderById[selectedInteraction.sender_id]
                              ? senderById[selectedInteraction.sender_id].avatar_url
                              : null
                            : selectedInteraction.receiver_id && receiverById[selectedInteraction.receiver_id]
                              ? receiverById[selectedInteraction.receiver_id].avatar_url
                              : null
                        }
                        message={selectedInteraction.message ?? ""}
                        onDeleteSent={
                          feedTab === "sent"
                            ? () => openDeleteConfirm(selectedInteraction.id)
                            : undefined
                        }
                        deleteSentPending={
                          pendingDeleteId === selectedInteraction.id ||
                          deleteConfirmForId === selectedInteraction.id
                        }
                      />
                ) : null}

                <Card
                  id="dashboard-interaction-feed"
                  className="scroll-mt-24 overflow-hidden border border-border p-0 shadow-none ring-0"
                >
                      <ScrollArea className="h-[min(56vh,30rem)]">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="h-12 w-[200px] pl-5 align-middle text-sm">
                                {feedTab === "received"
                                  ? t("Sender", "ပို့သူ")
                                  : t("Recipient", "လက်ခံသူ")}
                              </TableHead>
                              {feedTab === "sent" ? (
                                <>
                                  <TableHead className="h-12 w-[100px] align-middle text-sm">
                                    {t("Type", "အမျိုးအစား")}
                                  </TableHead>
                                  <TableHead className="h-12 min-w-[200px] align-middle text-sm">
                                    {t("Message", "စာ")}
                                  </TableHead>
                                </>
                              ) : null}
                              <TableHead className="h-12 w-[180px] pr-5 text-right align-middle text-sm">
                                {t("Time", "အချိန်")}
                              </TableHead>
                              {feedTab === "sent" ? (
                                <TableHead className="h-12 w-14 pr-5 text-center align-middle">
                                  <span className="sr-only">{t("Actions", "လုပ်ဆောင်ချက်များ")}</span>
                                </TableHead>
                              ) : null}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pagedItems.length === 0 ? (
                              <TableRow className="hover:bg-transparent">
                                <TableCell
                                  colSpan={feedTab === "sent" ? 5 : 2}
                                  className="h-28 py-8 text-center text-muted-foreground"
                                >
                                  {t(
                                    "No interactions match your filters.",
                                    "စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော interaction မရှိပါ။",
                                  )}
                                </TableCell>
                              </TableRow>
                            ) : (
                              pagedItems.map((row) => {
                                const peer =
                                  feedTab === "received"
                                    ? row.sender_id
                                      ? senderById[row.sender_id]
                                      : undefined
                                    : receiverById[row.receiver_id];
                                const who = peer
                                  ? `@${peer.username}`
                                  : feedTab === "received"
                                    ? t("Someone", "တစ်စုံတစ်ယောက်")
                                    : t("Unknown", "မသိရှိရ");
                                const body = (row.message ?? "").trim();
                                const isRead =
                                  feedTab !== "received" ||
                                  Boolean(row.receiver_read_at) ||
                                  readInteractionIds.has(row.id);
                                return (
                                  <TableRow
                                    key={row.id}
                                    className={cn(
                                      "cursor-pointer align-top [&>td]:py-4",
                                      feedTab === "received" && !isRead
                                        ? "bg-primary/5"
                                        : "",
                                    )}
                                    onClick={() => openInteraction(row.id)}
                                  >
                                    <TableCell className="pl-5">
                                      <div className="flex items-center gap-3">
                                        <Avatar
                                          src={peer?.avatar_url ?? null}
                                          size={32}
                                          className="size-8 shrink-0 ring-1 ring-border"
                                        />
                                        {feedTab === "received" && !isRead ? (
                                          <span
                                            className="inline-flex shrink-0 rounded-md bg-primary/10 p-1 ring-1 ring-primary/25 dark:bg-primary/15"
                                            aria-hidden
                                          >
                                            <Mail
                                              className="dashboard-unread-envelope-icon size-[1.15rem] text-primary sm:size-5"
                                              strokeWidth={2.25}
                                            />
                                          </span>
                                        ) : null}
                                        <div className="min-w-0 flex-1">
                                          <p className="truncate text-sm font-medium leading-tight text-foreground">
                                            {who}
                                          </p>
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            {feedTab === "received"
                                              ? t("Tap to open — surprise inside", "ဖွင့်ကြည့်ရန် — အတွင်းမှာ အံ့သြဖွယ်")
                                              : t("Recipient", "လက်ခံသူ")}
                                          </p>
                                        </div>
                                      </div>
                                    </TableCell>
                                    {feedTab === "sent" ? (
                                      <>
                                        <TableCell>
                                          <Badge
                                            variant="outline"
                                            className="rounded-full border-border/80 bg-muted/30 px-2.5 py-1 text-xs font-normal"
                                          >
                                            {TYPE_META[row.type].short}
                                          </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[min(42vw,380px)] whitespace-normal">
                                          <p className="line-clamp-2 text-sm leading-relaxed text-foreground/90 sm:text-[0.9375rem]">
                                            {body ||
                                              t("No message text.", "စာသားမပါရှိပါ။")}
                                          </p>
                                        </TableCell>
                                      </>
                                    ) : null}
                                    <TableCell className="pr-5 text-right text-xs tabular-nums text-muted-foreground sm:text-sm">
                                      <time dateTime={row.created_at} className="leading-tight">
                                        {formatInteractionTime(row.created_at)}
                                      </time>
                                    </TableCell>
                                    {feedTab === "sent" ? (
                                      <TableCell
                                        className="w-14 pr-4 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          className="size-9 text-muted-foreground hover:text-destructive"
                                          disabled={
                                            pendingDeleteId === row.id || deleteConfirmForId === row.id
                                          }
                                          aria-label={t("Delete from sent history", "ပို့မှု မှတ်တမ်းမှ ဖျက်ရန်")}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteConfirm(row.id);
                                          }}
                                        >
                                          <Trash2 className="size-4" aria-hidden />
                                        </Button>
                                      </TableCell>
                                    ) : null}
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <p className="text-sm text-muted-foreground">
                          {typeFiltered.length === 0
                            ? t("0 interactions", "0 ခု")
                            : t(
                                `Showing ${rangeStart}–${rangeEnd} of ${typeFiltered.length}`,
                                `${typeFiltered.length} ခုတွင် ${rangeStart}–${rangeEnd}`,
                              )}
                        </p>
                        <div className="flex items-center gap-1.5 sm:ml-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changePage(1)}
                            disabled={listPage <= 1}
                            aria-label={t("First page", "ပထမစာမျက်နှာ")}
                          >
                            <ChevronsLeft className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changePage(listPage - 1)}
                            disabled={listPage <= 1}
                            aria-label={t("Previous page", "အရင်စာမျက်နှာ")}
                          >
                            <ChevronLeft className="size-4" />
                          </Button>
                          <span className="min-w-[5rem] px-2 text-center text-sm text-muted-foreground">
                            {listPage} / {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changePage(listPage + 1)}
                            disabled={listPage >= totalPages}
                            aria-label={t("Next page", "နောက်စာမျက်နှာ")}
                          >
                            <ChevronRight className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-9"
                            onClick={() => changePage(totalPages)}
                            disabled={listPage >= totalPages}
                            aria-label={t("Last page", "နောက်ဆုံးစာမျက်နှာ")}
                          >
                            <ChevronsRight className="size-4" />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                </>
              )}
          </div>
          </div>
        </Card>
      </main>

      <AlertDialog
        open={deleteConfirmForId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmForId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("Delete this send?", "ဤပို့မှုကို ဖျက်မလား?")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t(
                "This removes the interaction from your sent list and from the recipient’s feed if they had not refreshed yet. This cannot be undone.",
                "သင့် ပို့မှု စာရင်းမှ ဖယ်ရှားပြီး လက်ခံသူ၏ ဖိဒ်မှလည်း ဖယ်ရှားပါမည်။ ပြန်မရပါ။",
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" className="w-full sm:w-auto">
              {t("Cancel", "ပယ်ဖျက်")}
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="w-full sm:w-auto"
              disabled={pendingDeleteId !== null}
              onClick={() => void executeConfirmedDelete()}
            >
              {pendingDeleteId !== null
                ? t("Deleting…", "ဖျက်နေသည်…")
                : t("Delete", "ဖျက်ရန်")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
