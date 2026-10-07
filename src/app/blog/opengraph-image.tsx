import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/seo";
export const alt = "Writing by Vishal Jadeja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function BlogImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#fafafa",
        color: "#18181b",
        padding: "70px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>
        VJ / writing
      </div>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
        Notes & ideas.
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#71717a" }}>
        {SITE_NAME} · Engineering, systems, and things I learn.
      </div>
    </div>,
    size,
  );
}
