import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Avatar } from "@/components/common/avatar";
import { PublicProfileSendForm } from "@/components/u/public-profile-send-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PublicUserPageProps = {
  params: Promise<{ username: string }>;
};

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
  const { data: senderProfile } = user
    ? await supabase.from("profiles").select("username, avatar_url").eq("id", user.id).maybeSingle()
    : { data: null };

  const isSelf = Boolean(user && user.id === profile.id);
  const signInHref = `/auth/sign-in?next=${encodeURIComponent(returnPath)}`;

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
      <section className="mobile-glass-card w-full max-w-xl rounded-3xl p-6 text-center sm:p-8">
        <p className="text-xs uppercase tracking-[0.2em] text-indigo-500">SecretGift Profile</p>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Send Gift To Your Friend</h1>
        <p className="mt-2 text-sm text-slate-600">
          Send a Thingyan splash, soot mark, or a small gift to @{profile.username}.
        </p>

        {isSelf ? (
          <div className="mx-auto mt-5 flex w-full max-w-md items-center justify-center rounded-2xl border border-indigo-100 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={profile.avatar_url} size={34} className="h-8 w-8" />
              <span className="truncate text-sm font-medium text-slate-700">@{profile.username}</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-5 flex w-full max-w-md items-center justify-between rounded-2xl border border-indigo-100 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={senderProfile?.avatar_url ?? null} size={34} className="h-8 w-8" />
              <span className="truncate text-sm font-medium text-slate-700">
                {senderProfile?.username ? `@${senderProfile.username}` : "Guest"}
              </span>
            </div>
            <span className="mx-2 text-indigo-300">→</span>
            <div className="flex min-w-0 items-center gap-2">
              <Avatar src={profile.avatar_url} size={34} className="h-8 w-8" />
              <span className="truncate text-sm font-medium text-slate-700">@{profile.username}</span>
            </div>
          </div>
        )}

        {!user ? (
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-white px-4 py-5 text-sm text-slate-700">
            <p>
              Open this public profile link (or QR), then sign in to send a message with one
              Thingyan action or gift.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={signInHref}
                className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
              >
                Continue with Google
              </Link>
            </div>
          </div>
        ) : (
          <PublicProfileSendForm
            receiverUsername={profile.username}
            isSelf={isSelf}
          />
        )}
      </section>
    </main>
  );
}
