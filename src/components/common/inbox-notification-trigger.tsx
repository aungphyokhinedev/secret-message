"use client";

import { Mail } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type InboxNotificationTriggerProps = {
  unreadCount: number;
  ariaLabel: string;
  title: string;
} & ({ href: string } | { onClick: () => void });

export function InboxNotificationTrigger(props: InboxNotificationTriggerProps) {
  const { unreadCount, ariaLabel, title } = props;
  const hasUnread = unreadCount > 0;
  const badgeText = unreadCount > 99 ? "99+" : String(unreadCount);

  const inner = (
    <>
      <Mail
        className={cn(
          "relative z-[1] size-4 stroke-[2]",
          hasUnread ? "inbox-notification-mail text-primary" : "text-muted-foreground",
        )}
        aria-hidden
      />
      {hasUnread ? (
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
    hasUnread
      ? "inbox-notification-btn--active text-primary hover:bg-primary/12 hover:text-primary"
      : "hover:bg-muted/60",
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
      onClick={props.onClick}
      aria-label={ariaLabel}
      title={title}
    >
      {inner}
    </Button>
  );
}
