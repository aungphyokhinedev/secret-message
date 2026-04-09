import Link from "next/link";
import { notFound } from "next/navigation";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSelf = Boolean(user && user.id === profile.id);
  const returnPath = `/u/${encodeURIComponent(profile.username)}`;
  const signInHref = `/auth/sign-in?next=${encodeURIComponent(returnPath)}`;
  const signUpHref = `/auth/sign-up?next=${encodeURIComponent(returnPath)}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-black px-6 py-10 text-white">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">SecretGift Profile</p>
        <div className="mt-4 flex justify-center">
          <Avatar src={profile.avatar_url} size={96} className="h-24 w-24" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">@{profile.username}</h1>
        <p className="mt-2 text-sm text-slate-300">
          Send a Thingyan splash, soot mark, or a small gift with an optional message.
        </p>

        {!user ? (
          <div className="mt-8 rounded-xl border border-white/10 bg-black/20 px-4 py-5 text-sm text-slate-200">
            <p>
              Open this public profile link (or QR), then sign in to send a message with one
              Thingyan action or gift.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={signInHref}
                className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Sign in
              </Link>
              <Link href={signUpHref} className="text-sm font-medium text-cyan-300 hover:text-cyan-200">
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <PublicProfileSendForm
            receiverUsername={profile.username}
            receiverAvatarUrl={profile.avatar_url}
            isSelf={isSelf}
          />
        )}
      </section>
    </main>
  );
}
