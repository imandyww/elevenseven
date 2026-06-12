import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdf6ec 0%, #e8f0fe 50%, #e6f7f1 100%)",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, display: "flex" }}>🤖🛍️</div>
        <div
          style={{
            marginTop: 28,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            display: "flex",
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 34,
            color: "#57534e",
            display: "flex",
          }}
        >
          {SITE_TAGLINE}
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 24,
            color: "#57534e",
            fontFamily: "monospace",
            display: "flex",
          }}
        >
          accuracy · memory · tools · trust — all under a dollar
        </div>
      </div>
    ),
    { ...size },
  );
}
