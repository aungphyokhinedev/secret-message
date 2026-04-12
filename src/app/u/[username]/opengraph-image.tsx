import { ImageResponse } from "next/og";

export const alt = "SecretGift — Thingyan profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Visual preview for `/u/:username` shares (title/description still carry Burmese in HTML meta). */
export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const handle = decodeURIComponent(username).replace(/[<>]/g, "").trim() || "friend";

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
          background: "linear-gradient(145deg, #dbeafe 0%, #fae8ff 42%, #cffafe 100%)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 999,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 36,
              fontWeight: 700,
            }}
          >
            {(handle.slice(0, 2) || "?").toUpperCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 58, fontWeight: 800, color: "#0f172a", letterSpacing: -1 }}>
              @{handle}
            </div>
            <div style={{ fontSize: 28, color: "#4f46e5", fontWeight: 600 }}>SecretGift</div>
          </div>
        </div>
        <div style={{ fontSize: 34, color: "#334155", fontWeight: 600, textAlign: "center", maxWidth: 920 }}>
          Splash water on me — Thingyan
        </div>
        <div style={{ fontSize: 24, color: "#64748b", marginTop: 16, textAlign: "center" }}>
          Open the link · Sign in · Send splashes and gifts
        </div>
      </div>
    ),
    { ...size },
  );
}
