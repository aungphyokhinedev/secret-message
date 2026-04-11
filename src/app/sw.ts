import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from "serwist";
import { NetworkOnly, Serwist } from "serwist";

/** Service worker global; kept local so we do not pull `no-default-lib` / webworker into the app TS program. */
interface SerwistWorkerGlobal extends SerwistGlobalConfig {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
}

declare const self: SerwistWorkerGlobal;

const apiBuildBypass: RuntimeCaching = {
  matcher: ({ sameOrigin, url: { pathname } }) => sameOrigin && pathname === "/api/build",
  method: "GET",
  handler: new NetworkOnly(),
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [apiBuildBypass, ...defaultCache],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();
