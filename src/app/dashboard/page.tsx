import { redirect } from "next/navigation";

import { InteractionsSummaryPanel } from "@/components/dashboard/interactions-summary-panel";
import { ProfileAvatarUploader } from "@/components/dashboard/profile-avatar-uploader";
import { SignOutButton } from "@/components/dashboard/sign-out-button";
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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Dashboard</p>
            <SupabaseConnectedBadge />
          </div>
          <h1 className="mt-2 text-3xl font-bold">Your Thingyan Interactions</h1>
          <p className="mt-1 text-sm text-slate-300">Signed in as {user.email}</p>
        </div>
        <SignOutButton />
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
        <ProfileAvatarUploader initialAvatarUrl={myProfile?.avatar_url ?? null} />
      </div>
    </main>
  );
}
