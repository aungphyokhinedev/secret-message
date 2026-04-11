import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SecretGift",
    short_name: "SecretGift",
    description: "Send secret messages and virtual gifts with timed reveals.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#fafafa",
    theme_color: "#6366f1",
    categories: ["social", "lifestyle"],
    icons: [
      {
        src: "/pwa-maskable.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/pwa-maskable.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
