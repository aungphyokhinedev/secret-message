"use client";

import Image from "next/image";
import Link from "next/link";

import { OAuthGoogleButton } from "@/components/auth/oauth-google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, H2, Lead, Muted, Small } from "@/components/ui/typography";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type SignInLandingProps = {
  afterAuth: string;
  urlError: string | null;
};

export function SignInLanding({ afterAuth, urlError }: SignInLandingProps) {
  const { t } = useUiLanguage();

  const features = [
    {
      title: t("Public profile", "လူသိရှင်ကြား ပရိုဖိုင်"),
      body: t(
        "Share one link so friends can send splashes, soot marks, and gifts with a message.",
        "သူငယ်ချင်းများက ရေပက်၊ အိုးမဲသုတ်၊ လက်ဆောင်များနှင့် စာတိုပါ ပို့နိုင်အောင် လင့်တစ်ခုမျှဝေပါ။",
      ),
    },
    {
      title: t("Timed fun", "အချိန်နှင့်တပြိုင် ပျော်ရွှင်မှု"),
      body: t(
        "Interactions show up on your home feed—keep the festival energy without the mess.",
        "လုပ်ဆောင်ချက်များကို ပင်မဖိဒ်တွင် မြင်ရပါသည်။ ပွဲတော်အတွေးပျော့ပျော့ ထိန်းသိမ်းပါ။",
      ),
    },
    {
      title: t("Your dashboard", "သင့် ဒက်ရှ်ဘုတ်"),
      body: t(
        "See what you have received, replay moments, and manage your share card in one place.",
        "လက်ခံထားသည်များကို ကြည့်ပါ၊ အခိုက်အနေများကို ပြန်ဖွင့်ပါ၊ မျှဝေကတ်ကို တစ်နေရာတည်းတွင် စီမံပါ။",
      ),
    },
  ];

  return (
    <main>
      <section id="hero" className="scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <Small className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {t("Online Thingyan", "အွန်လိုင်း သင်္ကြန်")}
          </Small>
          <H1 className="mt-4 scroll-m-0 text-balance text-4xl sm:text-5xl">
            {t("Welcome to Online Thingyan", "အွန်လိုင်း သင်္ကြန်သို့ ကြိုဆိုပါသည်")}
          </H1>
          <Lead className="mx-auto mt-4 max-w-xl text-pretty">
            {t(
              "Easy to share. Playful splashes and gifts. Built for friends celebrating Thingyan together—on any device.",
              "မျှဝေရလွယ်ကူပြီး ရေပက်နှင့် လက်ဆောင်များဖြင့် ပျော်ရွှင်စေသည်။ သင်္ကြန်ကို အတူတကွ ဂုဏ်ပြုသူငယ်ချင်းများအတွက်—ကိရိယာမရွေးပါ။",
            )}
          </Lead>

          <div className="mx-auto mt-10 w-full max-w-md">
            <Card className="text-left shadow-sm">
              <CardHeader className="space-y-1.5">
                <CardTitle>{t("Get started", "စတင်ရန်")}</CardTitle>
                <CardDescription>
                  {t(
                    "Sign in with Google to open your dashboard and share your public profile link.",
                    "Google ဖြင့် ဝင်ပြီး ဒက်ရှ်ဘုတ်ကို ဖွင့်ကာ သင့် public profile လင့်ကို မျှဝေပါ။",
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <OAuthGoogleButton nextPath={afterAuth} />
                {urlError ? (
                  <p className="text-sm text-destructive">{decodeURIComponent(urlError)}</p>
                ) : null}
              </CardContent>
              <CardFooter className="flex flex-col gap-3 text-xs text-muted-foreground">
                <p>
                  {t("Google sign-in is enabled for now.", "လက်ရှိတွင် Google sign-in သာ အသုံးပြုနိုင်ပါသည်။")}
                </p>
                <p>
                  <Link
                    href="/help"
                    className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                  >
                    {t("Help & how it works", "အကူအညီနှင့် အသုံးပြုနည်း")}
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-12">
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl sm:h-60 sm:w-60"
            aria-hidden
          />
          <Image
            src="/thingyan-hero.svg"
            alt={t("Thingyan festival illustration", "သင်္ကြန်ပွဲတော် ပုံဖော်ချက်")}
            width={1024}
            height={614}
            className="relative mx-auto h-auto w-full"
            priority
            sizes="(max-width: 640px) min(24rem, 100vw), 28rem"
          />
        </div>
      </section>

      <section id="features" className="scroll-mt-24 border-t border-border/60 bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <H2 className="scroll-m-0 text-center text-2xl sm:text-3xl">
            {t("Features", "အင်္ဂါရပ်များ")}
          </H2>
          <Muted className="mx-auto mt-2 max-w-lg text-center">
            {t(
              "Everything you need to run a playful Thingyan profile online.",
              "အွန်လိုင်းတွင် ပျော်ရွှင်စရာ သင်္ကြန် profile ကို လည်ပတ်ရန် လိုအပ်သမျှ။",
            )}
          </Muted>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {features.map((item) => (
              <Card key={item.title} className="border-border/80 bg-background/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{item.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <H2 className="scroll-m-0 text-2xl sm:text-3xl">{t("Contact", "ဆက်သွယ်ရန်")}</H2>
          <Muted className="mt-3 text-pretty">
            {t(
              "SecretGift is built for Thingyan season. After you sign in, use your dashboard to copy your link and invite friends.",
              "SecretGift သည် သင်္ကြန်ရာသီအတွက် ပြုလုပ်ထားသည်။ ဝင်ပြီးနောက် ဒက်ရှ်ဘုတ်မှ လင့်ကို ကူးပြီး သူငယ်ချင်းများကို ဖိတ်ခေါ်ပါ။",
            )}
          </Muted>
        </div>
      </section>
    </main>
  );
}
