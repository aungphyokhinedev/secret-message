import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { DeployVersionGuard } from "@/components/providers/deploy-version-guard";
import { PwaProvider } from "@/components/providers/pwa-provider";
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

const APP_NAME = "SecretGift";
const APP_DEFAULT_TITLE = "SecretGift";
const APP_TITLE_TEMPLATE = "%s — SecretGift";
const APP_DESCRIPTION = "Send secret messages and virtual gifts with timed reveals.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [{ url: "/pwa-maskable.svg", type: "image/svg+xml" }],
    apple: [{ url: "/pwa-maskable.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "dark light",
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
        <PwaProvider>
          <DeployVersionGuard />
          <SupabaseBrowserProvider supabaseUrl={url} supabaseAnonKey={anonKey}>
            <UiLanguageProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                {children}
              </ThemeProvider>
            </UiLanguageProvider>
          </SupabaseBrowserProvider>
        </PwaProvider>
      </body>
    </html>
  );
}
