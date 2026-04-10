"use client";

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
  Plus,
  Share2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Muted } from "@/components/ui/typography";
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
  senderById: Record<string, { username: string; avatar_url: string | null }>;
  currentUsername: string;
  userEmail: string;
  userAvatarUrl: string | null;
  notice?: string | null;
};

export function DashboardClient({
  items,
  senderById,
  currentUsername,
  userEmail,
  userAvatarUrl,
  notice,
}: DashboardClientProps) {
  const { t } = useUiLanguage();
  const [filterType, setFilterType] = useState<InteractionType | null>(null);
  const [listPage, setListPage] = useState(1);
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(null);

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

  const typeFiltered = useMemo(() => {
    if (!filterType) return items;
    return items.filter((row) => row.type === filterType);
  }, [items, filterType]);

  const totalPages = Math.max(1, Math.ceil(typeFiltered.length / PAGE_SIZE));

  useEffect(() => {
    setListPage((p) => Math.min(p, totalPages));
  }, [totalPages, filterType]);

  const pagedItems = typeFiltered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE);
  const selectedInteraction = typeFiltered.find((row) => row.id === selectedInteractionId) ?? null;

  const hasNoReceivedMessages = items.length === 0;
  const rangeStart = typeFiltered.length === 0 ? 0 : (listPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(listPage * PAGE_SIZE, typeFiltered.length);

  function toggleFilterType(type: InteractionType) {
    setFilterType((prev) => (prev === type ? null : type));
    setSelectedInteractionId(null);
    setListPage(1);
  }

  function changePage(next: number) {
    setListPage(Math.min(totalPages, Math.max(1, next)));
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground">
      <DashboardHeader
        currentUsername={currentUsername}
        userEmail={userEmail}
        userAvatarUrl={userAvatarUrl}
      />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-0">
          <div className="space-y-6 px-4 py-6 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Online Thingyan
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {t("Received interactions", "လက်ခံထားသော အပြန်အလှန်များ")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "Here's what friends sent you for Thingyan. Tap a metric to filter by type.",
                  "သူငယ်ချင်းများ ပို့သော အပြန်အလှန်များ။ Type စစ်ရန် metric ကို နှိပ်ပါ။",
                )}
              </p>
            </div>
            <Button
              type="button"
              className="shrink-0 gap-2 rounded-lg"
              onClick={() => window.dispatchEvent(new Event("secretgift:open-share-panel"))}
            >
              <Plus className="size-4" aria-hidden />
              {t("Share profile", "Profile မျှဝေရန်")}
            </Button>
          </div>

          <div className="space-y-6">
            {notice ? (
              <Card className="border-amber-500/25 bg-amber-500/5 py-3 shadow-none ring-0">
                <CardContent className="py-0 text-xs leading-relaxed text-foreground">
                  {notice}
                </CardContent>
              </Card>
            ) : null}

            {hasNoReceivedMessages ? (
                <Card className="border-border bg-muted/40 shadow-none ring-0">
                  <CardHeader>
                    <CardTitle className="font-heading text-base">
                      {t("No gifts or messages yet", "လက်ဆောင်နှင့် စာများ မရရှိသေးပါ")}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {t(
                        "Share your profile link so friends can open your page and send splashes, gifts, and messages.",
                        "သင့် profile link ကို မျှဝေပါ။ သူငယ်ချင်းများက ရေပက်၊ လက်ဆောင်နှင့် စာများ ပို့နိုင်ပါသည်။",
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-0 bg-transparent pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.dispatchEvent(new Event("secretgift:open-share-panel"))}
                      className="gap-2 rounded-lg"
                    >
                      <Share2 className="h-4 w-4 shrink-0" aria-hidden />
                      {t("Share profile", "Profile မျှဝေရန်")}
                    </Button>
                  </CardFooter>
                </Card>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {ALL_TYPES.map((type) => {
                      const active = filterType === type;
                      const Icon = TYPE_ICONS[type];
                      return (
                        <Button
                          key={type}
                          type="button"
                          variant="ghost"
                          onClick={() => toggleFilterType(type)}
                          aria-pressed={active}
                          className="h-auto min-h-0 w-full p-0 font-normal normal-case hover:bg-transparent"
                        >
                          <Card
                            size="sm"
                            className={cn(
                              "w-full gap-0 py-0 transition-colors",
                              active
                                ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-accent/60 shadow-none"
                                : "shadow-none ring-1 ring-border bg-card hover:bg-muted/50",
                            )}
                          >
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 pt-4">
                              <CardTitle className="text-left text-sm font-medium leading-tight text-muted-foreground">
                                {TYPE_META[type].short}
                              </CardTitle>
                              {active ? (
                                <CardAction>
                                  <span
                                    className="inline-flex size-6 items-center justify-center rounded-full border-2 border-primary bg-background text-primary"
                                    aria-hidden
                                  >
                                    <Check className="size-3.5" strokeWidth={2.5} />
                                  </span>
                                </CardAction>
                              ) : (
                                <Icon className="size-4 text-muted-foreground" aria-hidden />
                              )}
                            </CardHeader>
                            <CardContent className="pb-4 pt-0">
                              <p className="text-2xl font-bold tabular-nums text-foreground">{counts[type]}</p>
                            </CardContent>
                          </Card>
                        </Button>
                      );
                    })}
                </div>

                <div className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-medium text-foreground">
                        {t("Interaction feed", "Interaction စာရင်း")}
                      </p>
                      <Muted className="text-xs sm:text-right">
                        {t("Click a row to open the animation.", "Animation ဖွင့်ရန် အတန်းကို နှိပ်ပါ။")}
                      </Muted>
                    </div>

                {selectedInteraction ? (
                      <InteractionStageCard
                        type={selectedInteraction.type}
                        open
                        onClose={() => setSelectedInteractionId(null)}
                        receiverUsername={currentUsername}
                        senderLabel={
                          selectedInteraction.sender_id && senderById[selectedInteraction.sender_id]
                            ? `@${senderById[selectedInteraction.sender_id].username}`
                            : "Someone"
                        }
                        senderAvatarUrl={
                          selectedInteraction.sender_id && senderById[selectedInteraction.sender_id]
                            ? senderById[selectedInteraction.sender_id].avatar_url
                            : null
                        }
                        message={selectedInteraction.message ?? ""}
                      />
                ) : null}

                <Card className="overflow-hidden border border-border p-0 shadow-none ring-0">
                      <ScrollArea className="h-[min(55vh,28rem)]">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <TableHead className="w-[200px] pl-4">
                                {t("Sender", "ပို့သူ")}
                              </TableHead>
                              <TableHead className="w-[100px]">{t("Type", "အမျိုးအစား")}</TableHead>
                              <TableHead className="min-w-[200px]">
                                {t("Message", "စာ")}
                              </TableHead>
                              <TableHead className="w-[180px] text-right pr-4">
                                {t("Time", "အချိန်")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pagedItems.length === 0 ? (
                              <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                  {t(
                                    "No interactions match your filters.",
                                    "စစ်ထုတ်ချက်နှင့် ကိုက်ညီသော interaction မရှိပါ။",
                                  )}
                                </TableCell>
                              </TableRow>
                            ) : (
                              pagedItems.map((row) => {
                                const sender = row.sender_id ? senderById[row.sender_id] : undefined;
                                const who = sender ? `@${sender.username}` : "Someone";
                                const body = (row.message ?? "").trim();
                                return (
                                  <TableRow
                                    key={row.id}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedInteractionId(row.id)}
                                  >
                                    <TableCell className="pl-4">
                                      <div className="flex items-center gap-2">
                                        <Avatar
                                          src={sender?.avatar_url ?? null}
                                          size={32}
                                          className="size-8 shrink-0 ring-1 ring-border"
                                        />
                                        <span className="truncate font-medium">{who}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline" className="font-normal">
                                        {TYPE_META[row.type].short}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[min(40vw,320px)] whitespace-normal text-muted-foreground">
                                      <span className="line-clamp-2 text-sm">
                                        {body ||
                                          t("No message text.", "စာသားမပါရှိပါ။")}
                                      </span>
                                    </TableCell>
                                    <TableCell className="pr-4 text-right text-xs tabular-nums text-muted-foreground">
                                      <time dateTime={row.created_at}>{formatInteractionTime(row.created_at)}</time>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                      <CardFooter className="flex flex-col gap-3 border-t border-border bg-muted/30 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                          {typeFiltered.length === 0
                            ? t("0 interactions", "0 ခု")
                            : t(
                                `Showing ${rangeStart}–${rangeEnd} of ${typeFiltered.length}`,
                                `${typeFiltered.length} ခုတွင် ${rangeStart}–${rangeEnd}`,
                              )}
                        </p>
                        <div className="flex items-center gap-1 sm:ml-auto">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
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
                            className="size-8"
                            onClick={() => changePage(listPage - 1)}
                            disabled={listPage <= 1}
                            aria-label={t("Previous page", "အရင်စာမျက်နှာ")}
                          >
                            <ChevronLeft className="size-4" />
                          </Button>
                          <span className="min-w-[5rem] px-2 text-center text-xs text-muted-foreground">
                            {listPage} / {totalPages}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="size-8"
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
                            className="size-8"
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
    </div>
  );
}
