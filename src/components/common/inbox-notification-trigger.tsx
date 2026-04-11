"use client";

import { Loader2, Mail } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InboxNotificationTriggerProps = {
  unreadCount: number;
  ariaLabel: string;
  title: string;
  /** True while navigating (e.g. public profile → dashboard). Shows spinner and blocks repeat clicks. */
  pending?: boolean;
} & ({ href: string } | { onClick: () => void });

export function InboxNotificationTrigger(props: InboxNotificationTriggerProps) {
  const { unreadCount, ariaLabel, title, pending = false } = props;
  const hasUnread = unreadCount > 0;
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  const inner = (
    <>
      {pending ? (
        <Loader2
          className="relative z-[1] size-4 shrink-0 animate-spin text-primary"
          aria-hidden
        />
      ) : (
        <Mail
          className={cn(
            "relative z-[1] size-4 stroke-[2]",
            hasUnread ? "inbox-notification-mail text-primary" : "text-muted-foreground",
          )}
          aria-hidden
        />
      )}
      {hasUnread && !pending ? (
        <span
          className={cn(
            "inbox-notification-badge absolute -right-0.5 -top-0.5 z-[2] flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full px-1",
            "bg-gradient-to-b from-destructive via-destructive to-destructive/90 text-[0.65rem] font-bold leading-none text-destructive-foreground",
            "shadow-[0_2px_8px_rgba(0,0,0,0.18)] ring-2 ring-card",
          )}
        >
          {badgeText}
        </span>
      ) : null}
    </>
  );

  const triggerClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-lg" }),
    "relative shrink-0 overflow-visible rounded-full",
    pending && "pointer-events-none cursor-wait opacity-90",
    hasUnread && !pending
      ? "inbox-notification-btn--active text-primary hover:bg-primary/12 hover:text-primary"
      : !pending && "hover:bg-muted/60",
  );

  if ("href" in props) {
    return (
      <Link href={props.href} className={triggerClass} aria-label={ariaLabel} title={title}>
        {inner}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-lg"
      className={triggerClass}
      disabled={pending}
      onClick={pending ? undefined : props.onClick}
      aria-label={ariaLabel}
      aria-busy={pending}
      title={title}
    >
      {inner}
    </Button>
  );
}
