import { ImageResponse } from "next/og";

export const alt = "SecretGift — Thingyan share link";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generic OG art for `/p/:token` (username not exposed to anonymous crawlers). */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #e0e7ff 0%, #fdf4ff 50%, #a5f3fc 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#312e81",
            letterSpacing: -2,
            marginBottom: 20,
          }}
        >
          SecretGift
        </div>
        <div style={{ fontSize: 36, color: "#4338ca", fontWeight: 600, marginBottom: 12 }}>
          Thingyan · သင်္ကြန်
        </div>
        <div style={{ fontSize: 30, color: "#475569", textAlign: "center", maxWidth: 900, lineHeight: 1.35 }}>
          Splash water on me — open this link to send a message
        </div>
      </div>
    ),
    { ...size },
  );
}
