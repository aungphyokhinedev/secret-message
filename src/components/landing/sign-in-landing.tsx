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
        "You get one shareable link. Friends open it, sign in with Google, then send water splashes, soot, food, flowers, and a short message.",
        "သင့်တွင် မျှဝေရမည့် လင့်တစ်ခုရှိသည်။ သူငယ်ချင်းများက ဖွင့်၊ Google ဖြင့် ဝင်ရောက်ပြီးမှ ရေပက်၊ အိုးမဲသုတ်၊ အစားအစာ၊ ပန်းနှင့် စာတို ပို့နိုင်သည်။",
      ),
    },
    {
      title: t("Home feed", "ပင်မဖိဒ်"),
      body: t(
        "Everything you receive appears on your dashboard so you can open and enjoy it in one place.",
        "လက်ခံသည်အားလုံး ဒက်ရှ်ဘုတ်တွင် ပေါ်လာပြီး တစ်နေရာတည်းမှ ဖွင့်ကြည့်နိုင်သည်။",
      ),
    },
    {
      title: t("Share tools", "မျှဝေကိရိယာများ"),
      body: t(
        "After sign-in, copy your link from the dashboard and invite friends however you like.",
        "ဝင်ပြီးနောက် ဒက်ရှ်ဘုတ်မှ လင့်ကို ကူးပြီး သူငယ်ချင်းများကို ဖိတ်ခေါ်ပါ။",
      ),
    },
  ];

  return (
    <main className="text-foreground">
      <section id="hero" className="scroll-mt-24 px-4 pt-10 sm:px-6 sm:pt-14">
        <div className="mx-auto max-w-xl text-center sm:max-w-2xl">
          <Small className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("SecretGift · Online Thingyan", "SecretGift · အွန်လိုင်း သင်္ကြန်")}
          </Small>
          <H1 className="mt-3 scroll-m-0 text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.35rem]">
            {t("Sign in to celebrate Thingyan online", "သင်္ကြန်ကို အွန်လိုင်းတွင် ဂုဏ်ပြုရန် ဝင်ပါ")}
          </H1>
          <Lead className="mx-auto mt-3 max-w-lg text-pretty text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {t(
              "Use your Google account once. Then open your dashboard, copy your link, and let friends send you festival fun.",
              "Google အကောင့်ဖြင့် တစ်ကြိမ်သာ ဝင်ပါ။ ပြီးလျှင် ဒက်ရှ်ဘုတ်ဖွင့်၊ လင့်ကူးပြီး သူငယ်ချင်းများကို ပွဲတော်ပျော်ရွှင်မှု ပို့ခွင့်ပေးပါ။",
            )}
          </Lead>
        </div>

        <div className="mx-auto mt-8 w-full max-w-md sm:mt-10">
          <Card className="border-border/80 bg-card text-left shadow-md ring-1 ring-border/40">
            <CardHeader className="space-y-4 pb-2">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  {t("Sign in", "ဝင်ရောက်ရန်")}
                </CardTitle>
                <CardDescription className="mt-1.5 text-sm leading-relaxed">
                  {t(
                    "We use Google only to know who you are. We do not ask for a separate password.",
                    "Google ကို သင့်အထောက်အထားအတွက်သာ သုံးပါသည်။ သီးခြားစကားဝှက်မတောင်းပါ။",
                  )}
                </CardDescription>
              </div>
              <div className="rounded-lg border border-border/70 bg-muted/35 px-3.5 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("After you sign in", "ဝင်ပြီးနောက်")}
                </p>
                <ol className="mt-2.5 list-decimal space-y-2 pl-4 text-sm leading-snug text-foreground marker:font-semibold marker:text-primary">
                  <li>
                    {t("You land on your dashboard.", "ဒက်ရှ်ဘုတ်သို့ ရောက်ပါမည်။")}
                  </li>
                  <li>
                    {t("Copy your public profile link.", "သင့် public profile လင့်ကို ကူးပါ။")}
                  </li>
                  <li>
                    {t("Friends use that link to send you splashes and gifts.", "သူငယ်ချင်းများက ထိုလင့်မှ ရေပက်နှင့် လက်ဆောင်များ ပို့နိုင်သည်။")}
                  </li>
                </ol>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <OAuthGoogleButton nextPath={afterAuth} />
              {urlError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/35 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                >
                  <p className="font-medium">
                    {t("Could not complete sign-in", "ဝင်ရောက်ခြင်း မပြီးစီးပါ")}
                  </p>
                  <p className="mt-1 text-destructive/95">{decodeURIComponent(urlError)}</p>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 border-t border-border/60 bg-muted/20 px-6 py-4 text-xs text-muted-foreground">
              <p>
                {t(
                  "Only Google sign-in is available right now.",
                  "လက်ရှိတွင် Google ဖြင့် ဝင်ရောက်ခြင်းသာ ရှိပါသည်။",
                )}
              </p>
              <p>
                <Link
                  href="/help"
                  className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
                >
                  {t("How SecretGift works", "SecretGift အလုပ်လုပ်ပုံ")}
                </Link>
              </p>
            </CardFooter>
          </Card>
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
          <Muted className="mx-auto mt-3 max-w-lg text-center text-sm leading-relaxed sm:text-base">
            {t(
              "Three simple ideas behind SecretGift.",
              "SecretGift ၏ ရိုးရှင်းသော အကြံ ၃ ခု။",
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

      <section id="contact" className="scroll-mt-24 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-xl text-center">
          <H2 className="scroll-m-0 text-xl sm:text-2xl">{t("About this app", "ဤအက်ပ်အကြောင်း")}</H2>
          <Muted className="mt-3 text-pretty text-sm leading-relaxed sm:text-base">
            {t(
              "SecretGift is for Thingyan: sign in, share your link, and enjoy messages from friends in your dashboard.",
              "SecretGift သည် သင်္ကြန်အတွက် ဖြစ်သည် — ဝင်ပါ၊ လင့်မျှဝေပါ၊ သူငယ်ချင်းများ၏ စာများကို ဒက်ရှ်ဘုတ်တွင် ခံစားပါ။",
            )}
          </Muted>
        </div>
      </section>
    </main>
  );
}
