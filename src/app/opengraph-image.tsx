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
          background:
            "repeating-linear-gradient(90deg, rgba(226,43,47,.24) 0 80px, rgba(255,255,255,.7) 80px 160px, rgba(0,122,61,.24) 160px 240px, rgba(255,210,51,.35) 240px 320px), linear-gradient(180deg, #fffdf4 0%, #fff4ce 60%, #e6f7e8 100%)",
          color: "#1c1917",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 72, display: "flex", fontWeight: 800 }}>11:7</div>
        <div
          style={{
            marginTop: 28,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: 0,
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
          $1 digital goods · products.json · llms.txt
        </div>
      </div>
    ),
    { ...size },
  );
}
