/** Initials for avatar fallback (aligned with dashboard interaction card). */
export function profileInitialsFromLabel(label: string): string {
  const cleaned = label.replace(/^@/, "").trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]!}${parts[1]![0]!}`.toUpperCase();
  }
  const single = parts[0] ?? cleaned;
  return (single + single).slice(0, 2).toUpperCase();
}

export function emailLocalPart(email: string | undefined): string | null {
  if (!email?.includes("@")) return null;
  const local = email.split("@")[0]?.trim();
  return local || null;
}
