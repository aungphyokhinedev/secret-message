"use client";

import { OAuthGoogleButton } from "@/components/auth/oauth-google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="shadow-sm">
      <CardHeader className="space-y-1.5">
        <CardTitle>
          {isSignIn ? t("Sign in", "ဝင်ရန်") : t("Create account", "အကောင့်ဖန်တီးရန်")}
        </CardTitle>
        <CardDescription>
          {isSignIn
            ? t("Sign in to send secret messages and gifts.", "လျှို့ဝှက်စာနှင့် လက်ဆောင်များ ပို့ရန် ဝင်ပါ။")
            : t(
                "Start sharing private messages and virtual surprises.",
                "လျှို့ဝှက်စာများနှင့် virtual surprise များကို စတင်မျှဝေလိုက်ပါ။",
              )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <OAuthGoogleButton nextPath={redirectTo} />
        {initialError ? <p className="text-sm text-destructive">{initialError}</p> : null}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {t("Google sign-in is enabled for now.", "လက်ရှိတွင် Google sign-in သာ အသုံးပြုနိုင်ပါသည်။")}
      </CardFooter>
    </Card>
  );
}
