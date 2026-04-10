"use client";

import Link from "next/link";

import { LanguageSwitcher } from "@/components/common/language-switcher";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

const navLink =
  "text-xs font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm";

export function LandingHeader({ className }: { className?: string }) {
  const { t } = useUiLanguage();

  return (
    <header
      className={cn(
        "relative sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="relative mx-auto flex min-h-14 max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:min-h-16 sm:px-6 sm:py-0">
        <Link
          href="/auth/sign-in"
          className="font-heading text-sm font-semibold tracking-tight text-foreground sm:text-base"
        >
          SecretGift
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-6 lg:flex lg:gap-10"
          aria-label="Page sections"
        >
          <a href="/auth/sign-in#hero" className={navLink}>
            {t("Home", "ပင်မစာမျက်နှာ")}
          </a>
          <a href="/auth/sign-in#features" className={navLink}>
            {t("Features", "အင်္ဂါရပ်များ")}
          </a>
          <a href="/auth/sign-in#contact" className={navLink}>
            {t("Contact", "ဆက်သွယ်ရန်")}
          </a>
          <Link href="/help" className={navLink}>
            {t("Help", "အကူအညီ")}
          </Link>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LanguageSwitcher className="border-0 bg-transparent p-0 shadow-none ring-0" />
          <ThemeToggle />
        </div>
      </div>

      <nav
        className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-border/40 px-4 py-2.5 lg:hidden"
        aria-label="Page sections"
      >
        <a href="/auth/sign-in#hero" className={navLink}>
          {t("Home", "ပင်မစာမျက်နှာ")}
        </a>
        <a href="/auth/sign-in#features" className={navLink}>
          {t("Features", "အင်္ဂါရပ်များ")}
        </a>
        <a href="/auth/sign-in#contact" className={navLink}>
          {t("Contact", "ဆက်သွယ်ရန်")}
        </a>
        <Link href="/help" className={navLink}>
          {t("Help", "အကူအညီ")}
        </Link>
      </nav>
    </header>
  );
}
