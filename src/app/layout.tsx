import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { LanguageSwitcher } from "@/components/common/language-switcher";
import { SupabaseBrowserProvider } from "@/components/providers/supabase-browser-provider";
import { UiLanguageProvider } from "@/components/providers/ui-language-provider";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SecretGift",
  description: "Send secret messages and virtual gifts with timed reveals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { url, anonKey } = getSupabasePublicEnv();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SupabaseBrowserProvider supabaseUrl={url} supabaseAnonKey={anonKey}>
          <UiLanguageProvider>
            <div className="pointer-events-none fixed right-4 top-4 z-[60]">
              <div className="pointer-events-auto">
                <LanguageSwitcher compact />
              </div>
            </div>
            {children}
          </UiLanguageProvider>
        </SupabaseBrowserProvider>
      </body>
    </html>
  );
}
