"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { H1, H2, InlineCode, Lead, Muted, P } from "@/components/ui/typography";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

export function HelpPageContent() {
  const { t } = useUiLanguage();

  const steps: { title: string; body: string }[] = [
    {
      title: t("Sign in with Google", "Google ဖြင့် ဝင်ပါ"),
      body: t(
        "Use the button on the sign-in page. We only use Google for authentication—no separate password for this app.",
        "Sign-in စာမျက်နှာရှိ ခလုတ်ကို သုံးပါ။ ဤ app အတွက် သီးခြား စကားဝှက်မထားဘဲ Google သာ သုံးပါသည်။",
      ),
    },
    {
      title: t("Open your dashboard", "ဒက်ရှ်ဘုတ်ကို ဖွင့်ပါ"),
      body: t(
        "After sign-in you land on your dashboard. That is your home: received splashes, gifts, and messages, plus your share tools.",
        "ဝင်ပြီးနောက် ဒက်ရှ်ဘုတ်သို့ ရောက်သည်။ ရေပက်၊ လက်ဆောင်နှင့် စာများ လက်ခံထားမှုနှင့် မျှဝေကိရိယာများ ရှိသည်။",
      ),
    },
    {
      title: t("Copy and share your public link", "သင့် public လင့်ကို ကူးပြီး မျှဝေပါ"),
      body: t(
        "Your profile URL looks like /u/yourname (your username). Share it anywhere—chat, social, QR—so friends can open your page, sign in, and send you Thingyan interactions.",
        "သင့် profile URL သည် /u/yourname ပုံစံဖြစ်သည်။ ချက်တင်၊ လူမှုကွန်ရက်၊ QR စသဖြင့် မျှဝေပါ။ သူငယ်ချင်းများက သင့်စာမျက်နှာကို ဖွင့်၊ ဝင်ရောက်ပြီးမှ သင်္ကြန် အပြန်အလှန်များ ပို့နိုင်သည်။",
      ),
    },
    {
      title: t("Send to someone else", "တစ်စုံတစ်ယောက်ကို ပို့ပါ"),
      body: t(
        "Open a friend’s link while signed in, pick splash, soot, food, or flower, write a short message, and send. They will see it on their dashboard.",
        "သူငယ်ချင်း၏ လင့်ကို ဝင်ထားစဉ် ဖွင့်ပါ။ ရေပက်၊ အိုးမဲ၊ အစားအစာ၊ ပန်း ရွေးပြီး စာတိုရေးကာ ပို့ပါ။ သူတို့ ဒက်ရှ်ဘုတ်တွင် မြင်ရပါမည်။",
      ),
    },
    {
      title: t("Replay and read messages", "ပြန်ဖွင့်ပြီး စာဖတ်ပါ"),
      body: t(
        "On your dashboard you can open a row to watch the gift animation and read the full message. Use Replay if you want to see the animation again.",
        "ဒက်ရှ်ဘုတ်တွင် အတန်းကို နှိပ်ပြီး လက်ဆောင် animation ကြည့်ကာ စာအပြည့်အစ ဖတ်နိုင်သည်။ Animation ပြန်ကြည့်ချင်ပါက Replay ကို သုံးပါ။",
      ),
    },
  ];

  return (
    <main className="px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/auth/sign-in"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden />
          {t("Back to sign in", "ဝင်ရန် စာမျက်နှာသို့")}
        </Link>

        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t("SecretGift", "SecretGift")}
        </p>
        <H1 className="mt-2 scroll-m-0 text-balance text-3xl sm:text-4xl">
          {t("Help & how it works", "အကူအညီနှင့် အသုံးပြုနည်း")}
        </H1>
        <Lead className="mt-4 text-pretty">
          {t(
            "Short guide: sign in, share your profile link, send and receive Thingyan splashes and gifts with messages.",
            "တိုတောင်းစွာ—ဝင်ပါ၊ profile လင့်မျှဝေပါ၊ သင်္ကြန် ရေပက်နှင့် လက်ဆောင်များကို စာနှင့်အတူ ပို့လက်ခံပါ။",
          )}
        </Lead>

        <section className="mt-10 space-y-4" aria-labelledby="steps-heading">
          <H2 id="steps-heading" className="scroll-m-0 text-xl sm:text-2xl">
            {t("Steps", "အဆင့်များ")}
          </H2>
          <ol className="space-y-4">
            {steps.map((step, i) => (
              <li key={step.title}>
                <Card className="border-border/80 shadow-sm ring-0">
                  <CardHeader className="space-y-2 pb-4">
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full",
                          "bg-primary/10 text-sm font-semibold text-primary",
                        )}
                        aria-hidden
                      >
                        {i + 1}
                      </span>
                      <div className="min-w-0 space-y-1">
                        <CardTitle className="font-heading text-base leading-snug">{step.title}</CardTitle>
                        <CardDescription className="text-sm leading-relaxed">{step.body}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 border-t border-border pt-10" aria-labelledby="link-tip-heading">
          <H2 id="link-tip-heading" className="scroll-m-0 text-xl sm:text-2xl">
            {t("Sign-in links (optional)", "ဝင်ရန် လင့် (လိုအပ်ပါက)")}
          </H2>
          <P className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {t(
              "If you open a profile while logged out, we send you to sign-in and bring you back to that page afterward. You can also bookmark a destination with the next query, for example:",
              "Profile ကို ဝင်မထားဘဲ ဖွင့်ပါက ဝင်ရန်သို့ ပို့ပြီး ပြီးမှ ထိုစာမျက်နှာသို့ ပြန်ပို့ပါသည်။ နေရာသတ်မှတ်ချင်ပါက next query သုံးနိုင်သည်—ဥပမာ—",
            )}
          </P>
          <p className="mt-3 font-mono text-sm">
            <InlineCode className="break-all">
              /auth/sign-in?next=/u/username
            </InlineCode>
          </p>
          <Muted className="mt-4 text-pretty">
            {t(
              "Only paths on this site are allowed (must start with a single slash). If next is missing or unsafe, you go to the dashboard.",
              "ဤ site အတွင်းလမ်းကြောင်းများသာ ခွင့်ပြုသည်။ next မရှိ သို့မဟုတ် မသင့်တော်ပါက ဒက်ရှ်ဘုတ်သို့ သွားပါမည်။",
            )}
          </Muted>
        </section>
      </div>
    </main>
  );
}
