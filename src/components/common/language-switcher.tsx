"use client";

import { useUiLanguage } from "@/components/providers/ui-language-provider";

type LanguageSwitcherProps = {
  compact?: boolean;
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useUiLanguage();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white/90 p-1 shadow-sm">
      {!compact ? <span className="px-2 text-xs text-slate-500">Lang</span> : null}
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          language === "en" ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-indigo-50"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("my")}
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          language === "my" ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-indigo-50"
        }`}
      >
        မြန်မာ
      </button>
    </div>
  );
}
