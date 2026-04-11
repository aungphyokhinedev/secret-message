/**
 * Human-readable relative time for past dates (e.g. "5 min ago", "1 day ago").
 * Uses Intl.RelativeTimeFormat for en / my.
 */
export function formatRelativeTimeAgo(iso: string, language: "en" | "my"): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);

  const locale = language === "my" ? "my" : "en";
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSec < 0) {
    return date.toLocaleString(locale, { dateStyle: "medium", timeStyle: "short" });
  }

  if (diffSec < 60) {
    return rtf.format(-diffSec, "second");
  }

  const minutes = Math.floor(diffSec / 60);
  if (minutes < 60) {
    return rtf.format(-minutes, "minute");
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return rtf.format(-hours, "hour");
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return rtf.format(-days, "day");
  }

  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return rtf.format(-weeks, "week");
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return rtf.format(-months, "month");
  }

  const years = Math.floor(days / 365);
  return rtf.format(-years, "year");
}
