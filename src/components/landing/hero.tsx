import Link from "next/link";

type HeroProps = {
  isSignedIn: boolean;
};

export function Hero({ isSignedIn }: HeroProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 text-center md:text-left">
      <p className="mx-auto w-fit rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200 md:mx-0">
        Secret Message + Virtual Gifts
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-white md:max-w-3xl md:text-6xl">
        Send heartfelt secrets and digital surprises to the people you love.
      </h1>
      <p className="mx-auto max-w-2xl text-base text-slate-300 md:mx-0 md:text-lg">
        Create private messages, attach virtual gifts, and control when each surprise unlocks.
        Built with Supabase authentication and a secure PostgreSQL backend.
      </p>
      <div className="flex flex-col justify-center gap-3 md:flex-row md:justify-start">
        <Link
          href={isSignedIn ? "/dashboard" : "/auth/sign-up"}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          {isSignedIn ? "Open Dashboard" : "Create Your First Message"}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-300 hover:text-cyan-200"
        >
          Explore How It Works
        </Link>
      </div>
    </section>
  );
}
