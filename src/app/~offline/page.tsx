import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { H2, Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Offline — SecretGift",
  description: "You are offline.",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <H2>You are offline</H2>
      <Muted className="max-w-md">
        Check your connection, then try again. Pages you have visited may still open from the cache.
      </Muted>
      <Link href="/" className={cn(buttonVariants())}>
        Back home
      </Link>
    </main>
  );
}
