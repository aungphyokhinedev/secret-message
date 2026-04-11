"use client";

import * as React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const CHECK_INTERVAL_MS = 5 * 60 * 1000;

type BuildPayload = { buildId: string };

async function fetchCurrentBuildId(): Promise<string | null> {
  try {
    const res = await fetch("/api/build", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as BuildPayload;
    return typeof data.buildId === "string" ? data.buildId : null;
  } catch {
    return null;
  }
}

export function DeployVersionGuard() {
  const clientBuildId = process.env.NEXT_PUBLIC_APP_BUILD_ID ?? "development";
  const [stale, setStale] = React.useState(false);

  const runCheck = React.useCallback(async () => {
    if (typeof window === "undefined") return;
    const serverId = await fetchCurrentBuildId();
    if (serverId && serverId !== clientBuildId) {
      setStale(true);
    }
  }, [clientBuildId]);

  React.useEffect(() => {
    void runCheck();
    const onVisible = () => {
      if (document.visibilityState === "visible") void runCheck();
    };
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(() => void runCheck(), CHECK_INTERVAL_MS);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(interval);
    };
  }, [runCheck]);

  if (!stale) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[100] flex justify-center p-3 pointer-events-none">
      <Alert className="pointer-events-auto max-w-lg shadow-lg">
        <AlertTitle>A new version is available</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>Refresh to load the latest update.</span>
          <Button size="sm" type="button" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
