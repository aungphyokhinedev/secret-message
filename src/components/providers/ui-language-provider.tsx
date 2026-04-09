"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type UiLanguage = "en" | "my";

type UiLanguageContextValue = {
  language: UiLanguage;
  setLanguage: (lang: UiLanguage) => void;
  t: (en: string, my: string) => string;
};

const UiLanguageContext = createContext<UiLanguageContextValue | null>(null);

export function UiLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<UiLanguage>(() => {
    if (typeof window === "undefined") return "en";
    const saved = window.localStorage.getItem("ui-language");
    return saved === "my" ? "my" : "en";
  });

  function setLanguage(lang: UiLanguage) {
    setLanguageState(lang);
    window.localStorage.setItem("ui-language", lang);
  }

  const value = useMemo<UiLanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (en, my) => (language === "my" ? my : en),
    }),
    [language],
  );

  return <UiLanguageContext.Provider value={value}>{children}</UiLanguageContext.Provider>;
}

export function useUiLanguage() {
  const ctx = useContext(UiLanguageContext);
  if (!ctx) {
    throw new Error("useUiLanguage must be used within UiLanguageProvider.");
  }
  return ctx;
}
