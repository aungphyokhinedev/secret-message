import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { ShareCard } from "@/components/share/share-card";
import { PublicProfileHeaderNav } from "@/components/u/public-profile-header-nav";
import { PublicProfileSendForm } from "@/components/u/public-profile-send-form";
import { PublicProfileVisitorOwnLink } from "@/components/u/public-profile-visitor-own-link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { H3, Muted, Small } from "@/components/ui/typography";
import { BLOCKED_ACCOUNT_ERROR } from "@/lib/access-control";
import { profileInitialsFromLabel } from "@/lib/profile-initials";
import { countSentInteractionsSinceUtcDayStart } from "@/lib/sent-interactions-daily-count";
import { buildPublicProfileMetadata } from "@/lib/public-profile-share-metadata";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicUserPageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PublicUserPageProps): Promise<Metadata> {
  const { username } = await params;
  return buildPublicProfileMetadata({
    username,
    canonicalPath: `/u/${encodeURIComponent(username)}`,
  });
}

export default async function PublicUserPage({ params }: PublicUserPageProps) {
  if (!hasSupabaseEnv()) {
    notFound();
  }

  const { username } = await params;
  const supabase = await createSupabaseServerClient();
  const returnPath = `/u/${encodeURIComponent(username)}`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(returnPath)}`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }
  const { data: senderProfile } = await supabase
    .from("profiles")
    .select("username, avatar_url, is_premium, is_blocked")
    .eq("id", user.id)
    .maybeSingle();
  if (senderProfile?.is_blocked) {
    await supabase.auth.signOut();
    redirect(`/auth/sign-in?error=${encodeURIComponent(BLOCKED_ACCOUNT_ERROR)}`);
  }

  const startOfUtcDay = new Date();
  const dayStartIso = new Date(
    Date.UTC(startOfUtcDay.getUTCFullYear(), startOfUtcDay.getUTCMonth(), startOfUtcDay.getUTCDate()),
  ).toISOString();
  const dailyLimit = senderProfile?.is_premium ? 300 : 50;
  const dailyUsed = await countSentInteractionsSinceUtcDayStart(supabase, dayStartIso, user.id);

  const isSelf = Boolean(user.id === profile.id);
  if (isSelf) {
    redirect("/dashboard");
  }

  const { count: unreadReceivedCount } = await supabase
    .from("interactions_feed")
    .select("id", { count: "exact", head: true })
    .eq("receiver_id", user.id)
    .is("receiver_read_at", null);

  const { data: visitorShareLink } = await supabase
    .from("profile_share_links")
    .select("share_token")
    .eq("user_id", user.id)
    .maybeSingle();
  const visitorUsername = senderProfile?.username ?? "";
  const visitorShareToken = visitorShareLink?.share_token ?? null;

  return (
    <main className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/80 shadow-sm backdrop-blur-md">
        <PublicProfileHeaderNav
          unreadReceivedCount={unreadReceivedCount ?? 0}
          showShareOwnProfile={Boolean(visitorUsername)}
          shareProfileUsername={visitorUsername || null}
          shareProfileToken={visitorShareToken}
        />
      </header>

      <div className="w-full max-w-none pb-6 pt-0 sm:mx-auto sm:max-w-xl sm:px-6 sm:py-12">
        <Card className="overflow-visible rounded-none border-x-0 border-border/60 bg-card shadow-none ring-0 sm:rounded-xl sm:border-x sm:shadow-sm sm:ring-1 sm:ring-border/40">
          <CardHeader className="space-y-0 px-4 pb-2 pt-7 sm:space-y-6 sm:px-8 sm:pt-8">
            <div className="space-y-6">
              <div className="space-y-2.5">
                <Small className="text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                  Public profile
                </Small>
                <H3 className="scroll-m-0 border-0 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Send Your Message
                </H3>
                <Muted className="max-w-md text-sm leading-[1.6]">
                  Pick a splash or gift, add a short message, and send it. They will see it on their home
                  feed.
                </Muted>
              </div>

              <div className="-mx-4 flex flex-col border-y border-border/60 bg-muted/25 sm:mx-0 sm:rounded-xl sm:border">
                <div className="flex min-w-0 items-center gap-4 px-4 py-4 sm:px-5">
                  <Avatar size="lg" className="size-14 shrink-0 ring-2 ring-background sm:size-16">
                    {profile.avatar_url?.trim() ? (
                      <AvatarImage src={profile.avatar_url} alt={`Avatar for @${profile.username}`} />
                    ) : null}
                    <AvatarFallback className="text-sm font-medium">
                      {profileInitialsFromLabel(profile.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-lg font-semibold tracking-tight text-foreground"
                      title={`@${profile.username}`}
                    >
                      @{profile.username}
                    </p>
                  </div>
                </div>
              </div>

              {visitorUsername ? (
                <PublicProfileVisitorOwnLink username={visitorUsername} shareToken={visitorShareToken} />
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="space-y-0 px-4 pb-8 pt-2 sm:px-8 sm:pb-10">
            <PublicProfileSendForm
              receiverUsername={profile.username}
              isSelf={isSelf}
              dailyLimit={dailyLimit}
              dailyUsed={dailyUsed}
            />
          </CardContent>
        </Card>
      </div>
      {visitorUsername ? (
        <ShareCard username={visitorUsername} shareToken={visitorShareToken} />
      ) : null}
    </main>
  );
}
