import { ImageResponse } from "next/og";
import { PERSON, SITE_URL } from "@/lib/seo";

export const alt = `${PERSON.name} — ${PERSON.jobTitle}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#080808";
const CARD = "#111111";
const TEXT = "#efefef";
const MUTED = "#888888";
const BORDER = "#232323";

const TAGS = ["Node.js", "TypeScript", "React", "WebSockets", "MongoDB"];

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: 72,
          // Faint radial lift behind the headline, mirroring the site's glow.
          backgroundImage:
            "radial-gradient(900px 500px at 15% 0%, rgba(255,255,255,0.07), rgba(255,255,255,0) 70%)",
        }}
      >
        {/* Top row: monogram + domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 76,
              height: 76,
              borderRadius: 20,
              background: CARD,
              border: `1px solid ${BORDER}`,
              color: TEXT,
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          >
            VJ
          </div>
          <div style={{ display: "flex", color: MUTED, fontSize: 24 }}>
            {SITE_URL.replace(/^https?:\/\//, "")}
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: TEXT,
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            {PERSON.name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              color: MUTED,
              fontSize: 34,
              lineHeight: 1.35,
              maxWidth: 900,
            }}
          >
            {PERSON.shortDescription}
          </div>
        </div>

        {/* Bottom row: role pill + tech tags. `nowrap` everywhere keeps every
            pill a single line so their heights stay identical. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: 999,
              background: TEXT,
              color: BG,
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {PERSON.jobTitle}
          </div>
          {TAGS.map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                padding: "12px 22px",
                borderRadius: 999,
                background: CARD,
                border: `1px solid ${BORDER}`,
                color: MUTED,
                fontSize: 24,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
