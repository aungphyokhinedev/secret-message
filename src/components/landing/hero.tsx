"use client";

import Link from "next/link";

import { useUiLanguage } from "@/components/providers/ui-language-provider";

type HeroProps = {
  isSignedIn: boolean;
};

export function Hero({ isSignedIn }: HeroProps) {
  const { t } = useUiLanguage();
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-20 text-center md:text-left">
      <p className="mx-auto w-fit rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 md:mx-0">
        {t("Secret Message + Virtual Gifts", "လျှို့ဝှက်စာ + ဗာချွယ်လ် လက်ဆောင်")}
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:max-w-3xl md:text-6xl">
        {t(
          "Send heartfelt secrets and digital surprises to the people you love.",
          "ချစ်ရသူများထံ လျှို့ဝှက်စာနှင့် ဒစ်ဂျစ်တယ် အံ့အားသင့်စရာများ ပို့လိုက်ပါ။",
        )}
      </h1>
      <p className="mx-auto max-w-2xl text-base text-slate-600 md:mx-0 md:text-lg">
        {t(
          "Create private messages, attach virtual gifts, and control when each surprise unlocks. Built with Supabase authentication and a secure PostgreSQL backend.",
          "လျှို့ဝှက်စာများရေးပြီး ဗာချွယ်လ် လက်ဆောင်များတွဲပို့နိုင်သည်။ အံ့အားသင့်စရာဖွင့်ချိန်ကိုလည်း သင်ထိန်းချုပ်နိုင်သည်။ Supabase authentication နှင့် PostgreSQL backend ဖြင့် တည်ဆောက်ထားသည်။",
        )}
      </p>
      <div className="flex flex-col justify-center gap-3 md:flex-row md:justify-start">
        <Link
          href={isSignedIn ? "/dashboard" : "/auth/sign-up"}
          className="rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
        >
          {isSignedIn
            ? t("Open Dashboard", "ဒက်ရှ်ဘုတ်ဖွင့်ရန်")
            : t("Create Your First Message", "ပထမဆုံး Message ဖန်တီးရန်")}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full border border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-700 transition hover:border-indigo-300 hover:text-indigo-800"
        >
          {t("Explore How It Works", "အသုံးပြုပုံ ကြည့်ရန်")}
        </Link>
      </div>
    </section>
  );
}
