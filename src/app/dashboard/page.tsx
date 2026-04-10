import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { ShareCard } from "@/components/share/share-card";
import { Card, CardHeader } from "@/components/ui/card";
import { H2, InlineCode, P } from "@/components/ui/typography";
import { ensureProfileForAuthUser } from "@/lib/profile-bootstrap";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  if (!hasSupabaseEnv()) {
    return (
      <main className="flex min-h-screen items-center bg-background px-6 py-10">
        <Card className="mx-auto w-full max-w-lg border-amber-500/30 bg-amber-500/5 p-6 shadow-none ring-0">
          <CardHeader className="p-0">
            <H2 className="scroll-m-0 border-0 text-xl">Supabase setup required</H2>
            <P className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Add <InlineCode className="bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</InlineCode> and{" "}
              <InlineCode className="bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</InlineCode> to{" "}
              <InlineCode className="bg-muted px-1 py-0.5 font-mono text-xs">.env.local</InlineCode>, then restart the dev server.
            </P>
          </CardHeader>
        </Card>
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

  const senderByIdRecord = Object.fromEntries(senderById) as Record<
    string,
    { username: string; avatar_url: string | null }
  >;

  const { data: sentRows, error: sentError } = await supabase
    .from("interactions_feed")
    .select("id, sender_id, receiver_id, type, message, created_at")
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  let sentFeed = sentRows ?? [];
  let sentNotice: string | null = null;

  if (sentError) {
    const { data: rawSent, error: rawSentError } = await supabase
      .from("interactions")
      .select("id, sender_id, receiver_id, type, message, created_at")
      .eq("sender_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (rawSentError) {
      sentFeed = [];
      sentNotice = `Could not load sent history: ${sentError.message}. Re-run supabase/schema.sql if needed.`;
    } else {
      sentFeed = rawSent ?? [];
    }
  }

  const receiverIds = [...new Set(sentFeed.map((r) => r.receiver_id))];
  const receiverById = new Map<string, { username: string; avatar_url: string | null }>();
  if (receiverIds.length > 0) {
    const { data: receivers } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .in("id", receiverIds);

    for (const r of receivers ?? []) {
      receiverById.set(r.id, { username: r.username, avatar_url: r.avatar_url });
    }
  }

  const receiverByIdRecord = Object.fromEntries(receiverById) as Record<
    string,
    { username: string; avatar_url: string | null }
  >;

  return (
    <>
      <DashboardClient
        items={feed}
        sentItems={sentFeed}
        senderById={senderByIdRecord}
        receiverById={receiverByIdRecord}
        currentUsername={username}
        userEmail={user.email ?? ""}
        userAvatarUrl={myProfile?.avatar_url ?? null}
        notice={feedNotice}
        sentNotice={sentNotice}
      />
      <ShareCard username={username} />
    </>
  );
}
