"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

type NavigationProgressApi = {
  begin: () => void;
  complete: () => void;
};

const NavigationProgressContext = createContext<NavigationProgressApi | null>(null);

export function useNavigationProgress(): NavigationProgressApi {
  const ctx = useContext(NavigationProgressContext);
  return useMemo(
    () =>
      ctx ?? {
        begin: () => {},
        complete: () => {},
      },
    [ctx],
  );
}

/** True when we should show the bar for this anchor (internal route change). */
function shouldStartProgressForClick(
  pathname: string,
  currentSearch: string,
  href: string,
): boolean {
  try {
    const u = new URL(href, window.location.origin);
    if (u.origin !== window.location.origin) {
      return false;
    }
    const pathMatch = u.pathname === pathname;
    const cur = new URLSearchParams(currentSearch);
    const searchMatch = cur.toString() === u.searchParams.toString();
    if (!pathMatch || !searchMatch) {
      return true;
    }
    const hrefHasHash = Boolean(u.hash && u.hash.length > 1);
    if (hrefHasHash) {
      return false;
    }
    return false;
  } catch {
    return false;
  }
}

function NavigationProgressInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const urlKey = `${pathname}?${searchString}`;

  const [active, setActive] = useState(false);
  const staleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearStaleTimer = useCallback(() => {
    if (staleTimerRef.current) {
      clearTimeout(staleTimerRef.current);
      staleTimerRef.current = null;
    }
  }, []);

  const begin = useCallback(() => {
    clearStaleTimer();
    setActive(true);
    staleTimerRef.current = setTimeout(() => {
      setActive(false);
      staleTimerRef.current = null;
    }, 12_000);
  }, [clearStaleTimer]);

  const complete = useCallback(() => {
    clearStaleTimer();
    setActive(false);
  }, [clearStaleTimer]);

  const prevUrlKey = useRef(urlKey);
  useEffect(() => {
    if (prevUrlKey.current !== urlKey) {
      prevUrlKey.current = urlKey;
      complete();
    }
  }, [urlKey, complete]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const raw = (e.target as HTMLElement | null)?.closest?.("a[href]");
      if (!(raw instanceof HTMLAnchorElement)) return;
      if (raw.target === "_blank" || raw.download) return;
      const href = raw.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) return;
      if (!shouldStartProgressForClick(pathname, searchString, href)) return;
      begin();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [begin, pathname, searchString]);

  const api = useMemo(() => ({ begin, complete }), [begin, complete]);

  return (
    <NavigationProgressContext.Provider value={api}>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-[9998] h-[2px] overflow-hidden"
        aria-hidden
      >
        <div
          className={cn(
            "h-full w-full transition-opacity duration-200 ease-out",
            active ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="navigation-progress-bar__track h-full w-full bg-primary/15 dark:bg-primary/25">
            <div className="navigation-progress-bar__indeterminate h-full w-1/3 rounded-r-full bg-primary shadow-[0_0_10px_color-mix(in_oklch,var(--primary)_55%,transparent)]" />
          </div>
        </div>
      </div>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function NavigationProgressProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <NavigationProgressInner>{children}</NavigationProgressInner>
    </Suspense>
  );
}
