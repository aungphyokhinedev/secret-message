import { redirect } from "next/navigation";

import { InteractionsSummaryPanel } from "@/components/dashboard/interactions-summary-panel";
import { SupabaseConnectedBadge } from "@/components/dashboard/supabase-connected-badge";
import { ShareCard } from "@/components/share/share-card";
import { ensureProfileForAuthUser } from "@/lib/profile-bootstrap";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10">
        <section className="mx-auto w-full max-w-lg rounded-2xl border border-amber-300/30 bg-amber-500/10 p-6 text-amber-100">
          <h1 className="text-xl font-semibold">Supabase setup required</h1>
          <p className="mt-2 text-sm">
            Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to <code>.env.local</code>, then restart
            the dev server.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const username = await ensureProfileForAuthUser(supabase, user);
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: feedRows, error: feedError } = await supabase
    .from("interactions_feed")
    .select("id, sender_id, receiver_id, type, message, created_at")
    .eq("receiver_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  let feed = feedRows ?? [];
  let feedNotice: string | null = null;

  if (feedError) {
    const { data: rawRows, error: rawError } = await supabase
      .from("interactions")
      .select("id, receiver_id, type, message, created_at")
      .eq("receiver_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (rawError) {
      feed = [];
      feedNotice = `Could not load received interactions yet: ${feedError.message}. Re-run supabase/schema.sql in Supabase SQL editor.`;
    } else {
      // Fallback keeps messages visible even if the view is stale/missing in schema cache.
      feed = (rawRows ?? []).map((row) => ({
        ...row,
        sender_id: null,
      }));
      feedNotice =
        "Feed view is not ready in this Supabase project yet. Messages are shown, but sender names are hidden.";
    }
  }
  const senderIds = [...new Set(feed.map((r) => r.sender_id).filter(Boolean) as string[])];

  const senderById = new Map<string, { username: string; avatar_url: string | null }>();
  if (senderIds.length > 0) {
    const { data: senders } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", senderIds);

    for (const s of senders ?? []) {
      senderById.set(s.id, { username: s.username, avatar_url: s.avatar_url });
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-800 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">Dashboard</p>
            <SupabaseConnectedBadge />
          </div>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-bold text-slate-900">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-sky-500" aria-hidden>
              <path
                fill="currentColor"
                d="M12 2c-1.5 3-6 7-6 11a6 6 0 1 0 12 0c0-4-4.5-8-6-11Zm0 18a4 4 0 0 1-4-4c0-1.8 1.2-3.6 2.6-5.3a4.7 4.7 0 0 0 4.8 5.5 4 4 0 0 1-3.4 3.8Z"
              />
            </svg>
            <span>Online Thingyan</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">Signed in as {user.email}</p>
        </div>
      </div>

      <div className="mx-auto mt-8 w-full max-w-4xl space-y-6">
        <InteractionsSummaryPanel
          items={feed}
          senderById={senderById}
          currentUsername={username}
          currentAvatarUrl={myProfile?.avatar_url ?? null}
          notice={feedNotice}
        />
        <ShareCard username={username} />
      </div>
    </main>
  );
}
