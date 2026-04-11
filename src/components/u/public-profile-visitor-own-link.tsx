"use client";

import { useEffect, useRef, useState } from "react";

import { CopyProfileUrlButton } from "@/components/share/copy-profile-url-button";
import { ShareProfileNativeButton } from "@/components/share/share-profile-native-button";
import { useUiLanguage } from "@/components/providers/ui-language-provider";
import { cn } from "@/lib/utils";

type PublicProfileVisitorOwnLinkProps = {
  username: string;
  shareToken: string | null;
};

const BUTTON_PULSE_MS = 2800;

/** Visitor strip: hidden until first successful send, then revealed with intro emphasis. */
export function PublicProfileVisitorOwnLink({ username, shareToken }: PublicProfileVisitorOwnLinkProps) {
  const { t } = useUiLanguage();
  const [panelVisible, setPanelVisible] = useState(false);
  const [introBgEmphasis, setIntroBgEmphasis] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);
  const hasRevealedRef = useRef(false);
  const clearPulseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function dismissIntroEmphasis() {
    setIntroBgEmphasis(false);
  }

  useEffect(() => {
    function onMessageSent() {
      if (!hasRevealedRef.current) {
        hasRevealedRef.current = true;
        setPanelVisible(true);
        setIntroBgEmphasis(true);
        return;
      }

      setButtonPulse(true);
      if (clearPulseRef.current) {
        clearTimeout(clearPulseRef.current);
      }
      clearPulseRef.current = setTimeout(() => {
        setButtonPulse(false);
        clearPulseRef.current = null;
      }, BUTTON_PULSE_MS);
    }

    window.addEventListener("secretgift:public-profile-message-sent", onMessageSent);
    return () => {
      window.removeEventListener("secretgift:public-profile-message-sent", onMessageSent);
      if (clearPulseRef.current) {
        clearTimeout(clearPulseRef.current);
      }
    };
  }, []);

  if (!panelVisible) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label={t("Share your profile", "သင့် profile ကို မျှဝေပါ")}
      className={cn(
        "visitor-share-panel z-30 overflow-visible rounded-xl border-2 border-border/80 bg-card/95 px-3 py-3 shadow-[0_18px_44px_-14px_rgba(15,23,42,0.2)] backdrop-blur-[2px] dark:bg-card/90 dark:shadow-[0_22px_50px_-12px_rgba(0,0,0,0.55)]",
        "-mx-1 -translate-y-0.5 sm:mx-0 sm:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-8 zoom-in-[0.97] duration-700 fill-mode-both",
        introBgEmphasis &&
          "visitor-share-panel--intro-emphasis border-primary/45 bg-gradient-to-br from-primary/[0.12] via-card/95 to-amber-400/[0.07]",
      )}
      onPointerDownCapture={() => {
        if (introBgEmphasis) {
          dismissIntroEmphasis();
        }
      }}
      onFocusCapture={() => {
        if (introBgEmphasis) {
          dismissIntroEmphasis();
        }
      }}
    >
      <div className="relative z-[1] space-y-0">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t(
            "Want gifts and messages from others too? Share your profile so people can open your page and send you splashes and gifts.",
            "သင်လည်း လက်ဆောင်နှင့် စာများ လက်ခံလိုပါသလား။ သင့် profile ကို မျှဝေပါ၊ လူများက သင့်စာမျက်နှာဖွင့်ပြီး ရေပက်နှင့် လက်ဆောင်များ ပို့နိုင်သည်။",
          )}
        </p>
        <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <ShareProfileNativeButton
            username={username}
            shareToken={shareToken}
            size="default"
            pulseHighlight={buttonPulse}
            className="h-9 min-h-9 flex-1 justify-center px-3 text-xs sm:text-sm"
          >
            {t("Share profile", "Profile မျှဝေရန်")}
          </ShareProfileNativeButton>
          <CopyProfileUrlButton
            username={username}
            shareToken={shareToken}
            pulseHighlight={buttonPulse}
            className="min-h-9 flex-1 justify-center"
          />
        </div>
      </div>
    </div>
  );
}
