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
      <svg viewBox="0 0 24 24" className="h-2/3 w-2/3" aria-hidden>
        <path
          fill="currentColor"
          d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z"
        />
      </svg>
    </span>
  );
}
