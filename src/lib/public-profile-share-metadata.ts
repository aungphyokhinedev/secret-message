import type { Metadata } from "next";

/** Base site URL for canonical and OG resolution (see root layout metadataBase). */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

/** Line shown as og:title / twitter:title for `/u/:username` shares. */
export function publicProfileShareTitle(username: string) {
  const safe = username.replace(/[<>]/g, "").trim();
  return `@${safe} · SecretGift`;
}

/**
 * Primary social description: Burmese (Thingyan “splash water on me”) + English for broader crawlers.
 * Shown in og:description / meta description (not only the OG image).
 */
export function publicProfileShareDescription(username: string) {
  const safe = username.replace(/[<>]/g, "").trim();
  return [
    `ကျွန်တော့်ကို သင်္ကြန်ရေပက်ပေးပါ — @${safe}`,
    "Splash Thingyan water on me. Open this link, sign in with Google, and send splashes, gifts, and a short message on SecretGift.",
  ].join(" ");
}

/** Share link `/p/:token` — username not available to anonymous metadata; generic copy. */
export function tokenShareLinkTitle() {
  return "SecretGift · သင်္ကြန်လင့်";
}

export function tokenShareLinkDescription() {
  return [
    "ကျွန်တော့်ကို ရေပက်ပေးရန် ဤလင့်ကို ဖွင့်ပါ — SecretGift မှ ဝင်ပြီး စာနှင့် လက်ဆောင်များ ပို့ပါ။",
    "Open this SecretGift link, sign in, and splash water, send gifts, and a message for Thingyan.",
  ].join(" ");
}

export function buildPublicProfileMetadata(opts: {
  username: string;
  canonicalPath: string;
}): Metadata {
  const title = publicProfileShareTitle(opts.username);
  const description = publicProfileShareDescription(opts.username);
  const url = `${getSiteUrl()}${opts.canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "SecretGift",
      locale: "my_MM",
      alternateLocale: ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}

export function buildTokenShareMetadata(opts: { canonicalPath: string }): Metadata {
  const title = tokenShareLinkTitle();
  const description = tokenShareLinkDescription();
  const url = `${getSiteUrl()}${opts.canonicalPath}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "SecretGift",
      locale: "my_MM",
      alternateLocale: ["en_US"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: { index: true, follow: true },
  };
}
