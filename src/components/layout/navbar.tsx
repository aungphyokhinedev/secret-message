"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useUiLanguage } from "@/components/providers/ui-language-provider";

type NavbarProps = {
  userEmail?: string | null;
};

export function Navbar({ userEmail }: NavbarProps) {
  const { t } = useUiLanguage();
  return (
    <header className="border-b border-indigo-100 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-sm font-semibold tracking-wide text-indigo-600">
          SecretGift
        </Link>

        <nav className="flex items-center gap-3">
          <LanguageSwitcher compact />
          {userEmail ? (
            <Link
              href="/dashboard"
              className="rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              {t("Dashboard", "ဒက်ရှ်ဘုတ်")}
            </Link>
          ) : (
            <Link
              href="/auth/sign-in"
              className="rounded-full bg-orange-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-300"
            >
              {t("Continue with Google", "Google ဖြင့် ဆက်လုပ်ရန်")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
