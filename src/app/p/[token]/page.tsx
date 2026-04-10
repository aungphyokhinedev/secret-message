import { ArrowDown } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { PublicProfileSendForm } from "@/components/u/public-profile-send-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BLOCKED_ACCOUNT_ERROR } from "@/lib/access-control";
import { emailLocalPart, profileInitialsFromLabel } from "@/lib/profile-initials";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicTokenPageProps = {
  params: Promise<{ token: string }>;
};

export default async function PublicTokenPage({ params }: PublicTokenPageProps) {
  if (!hasSupabaseEnv()) {
    notFound();
  }

  const { token } = await params;
  const supabase = await createSupabaseServerClient();
  const returnPath = `/p/${encodeURIComponent(token)}`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(returnPath)}`);
  }

  const { data: resolvedProfile } = await supabase.rpc("get_profile_by_share_token", {
    p_token: token,
  });
  const profile = resolvedProfile?.[0];

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
  const { count: sentTodayCount } = await supabase
    .from("interactions_feed")
    .select("id", { count: "exact", head: true })
    .eq("sender_id", user.id)
    .gte("created_at", dayStartIso);
  const dailyLimit = senderProfile?.is_premium ? 300 : 50;
  const dailyUsed = sentTodayCount ?? 0;

  const isSelf = Boolean(user.id === profile.id);
  const senderHandle =
    senderProfile?.username ?? emailLocalPart(user.email ?? undefined) ?? null;
  const senderDisplay = senderHandle ? `@${senderHandle}` : "You";
  const senderInitialsSource = senderHandle ?? emailLocalPart(user.email ?? undefined) ?? "user";
  const senderAvatarAlt = senderHandle ? `Avatar for ${senderDisplay}` : "Your avatar";

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-8">
        <Card className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-0">
          <CardHeader className="space-y-0 px-4 pt-6 text-center sm:px-6 sm:pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              SecretGift Profile
            </p>
            <h1 className="mt-1 scroll-m-0 text-balance text-2xl font-bold tracking-tight text-foreground">
              Send Gift To Your Friend
            </h1>
            <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              Send a Thingyan splash, soot mark, or a small gift to @{profile.username}.
            </p>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-6 pt-2 sm:px-6 sm:pb-8">
            {isSelf ? (
              <div className="flex w-full items-center justify-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                <Avatar size="lg" className="shrink-0">
                  {profile.avatar_url?.trim() ? (
                    <AvatarImage
                      src={profile.avatar_url}
                      alt={`Avatar for @${profile.username}`}
                    />
                  ) : null}
                  <AvatarFallback className="text-xs font-medium">
                    {profileInitialsFromLabel(profile.username)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  <span className="block truncate text-sm font-medium text-foreground">
                    @{profile.username}
                  </span>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">Your profile</p>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col gap-2">
                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="lg" className="shrink-0">
                      {senderProfile?.avatar_url?.trim() ? (
                        <AvatarImage src={senderProfile.avatar_url} alt={senderAvatarAlt} />
                      ) : null}
                      <AvatarFallback className="text-xs font-medium">
                        {profileInitialsFromLabel(senderInitialsSource)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {senderDisplay}
                      </span>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">You send</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center py-1" aria-hidden>
                  <span className="inline-flex items-center justify-center rounded-full border border-border bg-background p-2 text-muted-foreground shadow-sm">
                    <ArrowDown className="h-4 w-4" />
                  </span>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar size="lg" className="shrink-0">
                      {profile.avatar_url?.trim() ? (
                        <AvatarImage
                          src={profile.avatar_url}
                          alt={`Avatar for @${profile.username}`}
                        />
                      ) : null}
                      <AvatarFallback className="text-xs font-medium">
                        {profileInitialsFromLabel(profile.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 text-left">
                      <span className="block truncate text-sm font-medium text-foreground">
                        @{profile.username}
                      </span>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">Receives</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <PublicProfileSendForm
              receiverUsername={profile.username}
              isSelf={isSelf}
              dailyLimit={dailyLimit}
              dailyUsed={dailyUsed}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
