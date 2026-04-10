import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SupabaseBrowserProvider } from "@/components/providers/supabase-browser-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background">
        <SupabaseBrowserProvider supabaseUrl={url} supabaseAnonKey={anonKey}>
          <UiLanguageProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
            </ThemeProvider>
          </UiLanguageProvider>
        </SupabaseBrowserProvider>
      </body>
    </html>
  );
}
