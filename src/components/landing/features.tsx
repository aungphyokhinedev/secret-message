"use client";

import { H3, Muted } from "@/components/ui/typography";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

export function Features() {
  const { t } = useUiLanguage();
  const features = [
    {
      title: t("Private by design", "လုံခြုံရေးအခြေပြု ဒီဇိုင်း"),
      description: t(
        "Messages are stored securely and only shown to authorized recipients.",
        "Message များကို လုံခြုံစွာသိမ်းဆည်းပြီး ခွင့်ပြုထားသူများသာ ကြည့်နိုင်ပါသည်။",
      ),
    },
    {
      title: t("Gift moments", "လက်ဆောင်အတွေ့အကြုံ"),
      description: t(
        "Attach digital gifts like coupons, audio notes, and surprise images.",
        "Coupon, အသံမှတ်စု၊ surprise ပုံများစသည့် ဒစ်ဂျစ်တယ်လက်ဆောင်များ ပူးတွဲပို့နိုင်သည်။",
      ),
    },
    {
      title: t("Timed unlocks", "အချိန်သတ်မှတ်ဖွင့်ခြင်း"),
      description: t(
        "Schedule delivery and reveal your surprise exactly when it matters.",
        "ပို့ချိန်ကို စီမံပြီး လိုအပ်သည့်အချိန်တိတိမှာ surprise ကို ဖွင့်ပြနိုင်သည်။",
      ),
    },
  ];

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 pb-20 md:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm"
        >
          <H3 className="scroll-m-0 text-xl text-indigo-700">{feature.title}</H3>
          <Muted className="mt-3 text-base leading-6 text-slate-600">{feature.description}</Muted>
        </article>
      ))}
    </section>
  );
}
