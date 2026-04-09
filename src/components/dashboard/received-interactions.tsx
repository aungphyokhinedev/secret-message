import type { Database } from "@/types/database";
import { Avatar } from "@/components/common/avatar";

type InteractionRow = Database["public"]["Views"]["interactions_feed"]["Row"];

const TYPE_LABEL: Record<Database["public"]["Enums"]["interaction_type"], string> = {
  water_splash: "Water splash",
  black_soot: "Black soot",
  food: "Sweet (mont lone)",
  flower: "Flower (padauk)",
};

type ReceivedInteractionsProps = {
  items: InteractionRow[];
  senderById: Map<string, { username: string; avatar_url: string | null }>;
  notice?: string | null;
};

export function ReceivedInteractions({ items, senderById, notice }: ReceivedInteractionsProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">Received splashes &amp; gifts</h2>
      <p className="mt-1 text-xs text-slate-400">
        Sender names appear only if you have a premium feed; otherwise you will see “Someone”.
      </p>
      {notice ? (
        <p className="mt-2 rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {notice}
        </p>
      ) : null}
      <ul className="mt-4 space-y-3">
        {items.length === 0 ? (
          <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-6 text-sm text-slate-300">
            Nothing yet. Share your profile link so friends can send you Thingyan interactions.
          </li>
        ) : (
          items.map((row) => {
            const sender =
              row.sender_id && senderById.has(row.sender_id)
                ? senderById.get(row.sender_id)!
                : null;
            const who = sender ? `@${sender.username}` : "Someone";
            const when = new Date(row.created_at).toLocaleString();

            return (
              <li
                key={row.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4 text-left"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-cyan-300">
                  <span className="font-medium text-white">{who}</span>
                  <span className="text-slate-500">·</span>
                  <span>{TYPE_LABEL[row.type]}</span>
                  <span className="text-slate-500">·</span>
                  <time dateTime={row.created_at}>{when}</time>
                </div>
                <Avatar src={sender?.avatar_url ?? null} size={32} className="mt-2 h-8 w-8" />
                <p className="mt-2 text-sm text-slate-200">
                  {row.message?.trim() ? row.message : "No message text."}
                </p>
              </li>
            );
          })
        )}
      </ul>
    </section>
  );
}
