"use client";

import { createBrowserClient } from "@supabase/ssr";
import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Database } from "@/types/database";

type SupabaseBrowserClient = ReturnType<typeof createBrowserClient<Database>>;

const SupabaseBrowserContext = createContext<SupabaseBrowserClient | null>(null);

export function SupabaseBrowserProvider({
  children,
  supabaseUrl,
  supabaseAnonKey,
}: {
  children: ReactNode;
  supabaseUrl: string;
  supabaseAnonKey: string;
}) {
  const client = useMemo(() => {
    if (!supabaseUrl?.trim() || !supabaseAnonKey?.trim()) {
      return null;
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
  }, [supabaseUrl, supabaseAnonKey]);

  return (
    <SupabaseBrowserContext.Provider value={client}>{children}</SupabaseBrowserContext.Provider>
  );
}

export function useSupabaseBrowser(): SupabaseBrowserClient {
  const client = useContext(SupabaseBrowserContext);
  if (!client) {
    throw new Error(
      "Supabase client is not available. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and restart the dev server.",
    );
  }
  return client;
}

export function useSupabaseBrowserOptional(): SupabaseBrowserClient | null {
  return useContext(SupabaseBrowserContext);
}
