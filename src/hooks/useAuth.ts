"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { useSupabaseBrowserOptional } from "@/components/providers/supabase-browser-provider";

export function useAuth() {
  const supabase = useSupabaseBrowserOptional();
  const [user, setUser] = useState<User | null>(null);
  const [sessionResolved, setSessionResolved] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        setSessionResolved(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionResolved(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const loading = Boolean(supabase) && !sessionResolved;

  return { user, loading, supabase };
}
