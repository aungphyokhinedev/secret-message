"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useSupabaseBrowserOptional } from "@/components/providers/supabase-browser-provider";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";
import { safeRedirectPath } from "@/lib/safe-redirect-path";

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type OAuthGoogleButtonProps = {
  nextPath?: string;
};

export function OAuthGoogleButton({ nextPath }: OAuthGoogleButtonProps) {
  const supabase = useSupabaseBrowserOptional();
  const { t } = useUiLanguage();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const client = supabase;
  if (!client) {
    return null;
  }

  const destination = safeRedirectPath(nextPath ?? "/dashboard");

  async function handleClick() {
    const c = client;
    if (!c) return;

    setError(null);
    setPending(true);
    let willNavigate = false;
    try {
      const origin = window.location.origin;
      const next = encodeURIComponent(destination);
      const { data, error: oauthError } = await c.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/callback?next=${next}`,
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        return;
      }

      if (data.url) {
        willNavigate = true;
        window.location.assign(data.url);
        return;
      }

      setError(t("Could not start Google sign-in.", "Google ဖြင့် ဝင်ရောက်ခြင်း မစတင်နိုင်ပါ။"));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Something went wrong.", "အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။"));
    } finally {
      if (!willNavigate) {
        setPending(false);
      }
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={() => void handleClick()}
        disabled={pending}
        className={cn(
          "oauth-google-btn relative z-0 h-auto min-h-12 w-full gap-3 overflow-hidden border-2 border-border px-5 py-3.5 text-base font-semibold shadow-md",
          "transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out",
          "hover:border-primary/55 hover:bg-muted/50 hover:shadow-lg",
          "focus-visible:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-primary/25",
          "active:enabled:scale-[0.985] dark:border-input dark:bg-card dark:hover:bg-muted/40",
          !pending && "oauth-google-btn--emphasize",
          pending &&
            "oauth-google-btn--pending pointer-events-none border-primary/45 bg-muted/40 shadow-lg shadow-primary/10 dark:bg-muted/30",
        )}
        aria-busy={pending}
      >
        <span
          className={cn(
            "relative z-[1] flex size-[22px] shrink-0 items-center justify-center",
            pending && "oauth-google-btn__icon-slot",
          )}
          aria-hidden
        >
          {pending ? (
            <Loader2 className="size-[22px] animate-spin text-primary" />
          ) : (
            <GoogleMark className={cn("size-[22px]", "oauth-google-btn__mark")} />
          )}
        </span>
        <span
          className={cn(
            "relative z-[1] min-w-0 transition-opacity duration-200",
            pending && "opacity-95",
          )}
        >
          {pending ? t("Redirecting...", "ပြန်လည်ညွှန်းပို့နေသည်...") : t("Continue with Google", "Google ဖြင့် ဆက်လုပ်ရန်")}
        </span>
      </Button>
      {error ? <p className="text-center text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
