import { UserRound } from "lucide-react";

type AvatarProps = {
  src?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackLabel?: string;
};

export function Avatar({
  src,
  alt = "Avatar",
  size = 40,
  className = "",
  fallbackLabel = "Default avatar",
}: AvatarProps) {
  const resolved = src?.trim();

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- Avatar hosts can vary (OAuth/user uploads).
      <img
        src={resolved}
        alt={alt}
        width={size}
        height={size}
        className={`rounded-full border border-white/15 object-cover ${className}`.trim()}
      />
    );
  }

  return (
    <span
      aria-label={fallbackLabel}
      className={`inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-300 ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      <UserRound className="h-2/3 w-2/3" strokeWidth={1.5} aria-hidden />
    </span>
  );
}
