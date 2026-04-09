"use client";

import { OAuthGoogleButton } from "@/components/auth/oauth-google-button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  initialError?: string;
  /** Post-auth redirect (relative path only). */
  redirectTo?: string;
};

export function AuthForm({ mode, initialError, redirectTo }: AuthFormProps) {
  const { t } = useUiLanguage();
  const isSignIn = mode === "sign-in";

  return (
    <div className="w-full rounded-3xl border border-indigo-100 bg-white p-6 text-slate-800 shadow-[0_14px_40px_rgba(79,70,229,0.12)]">
      <h2 className="text-xl font-semibold text-slate-900">
        {isSignIn ? t("Sign in", "ဝင်ရန်") : t("Create account", "အကောင့်ဖန်တီးရန်")}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {isSignIn
          ? t("Sign in to send secret messages and gifts.", "လျှို့ဝှက်စာနှင့် လက်ဆောင်များ ပို့ရန် ဝင်ပါ။")
          : t(
              "Start sharing private messages and virtual surprises.",
              "လျှို့ဝှက်စာများနှင့် virtual surprise များကို စတင်မျှဝေလိုက်ပါ။",
            )}
      </p>

      <div className="mt-5">
        <OAuthGoogleButton nextPath={redirectTo} />
      </div>
      {initialError ? <p className="mt-3 text-sm text-rose-500">{initialError}</p> : null}

      <p className="mt-4 text-sm text-slate-600">
        {t("Google sign-in is enabled for now.", "လက်ရှိတွင် Google sign-in သာ အသုံးပြုနိုင်ပါသည်။")}
      </p>
    </div>
  );
}
