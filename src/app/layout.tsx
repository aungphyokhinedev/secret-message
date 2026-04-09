import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SupabaseBrowserProvider } from "@/components/providers/supabase-browser-provider";
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
          {children}
        </SupabaseBrowserProvider>
      </body>
    </html>
  );
}
