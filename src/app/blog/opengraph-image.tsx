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
        background: "#101010",
        color: "#ededed",
        padding: "70px 80px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#999999" }}>
        VJ / writing
      </div>
      <div style={{ display: "flex", fontSize: 96, fontWeight: 700 }}>
        Notes & ideas.
      </div>
      <div style={{ display: "flex", fontSize: 28, color: "#999999" }}>
        {SITE_NAME} · Engineering, systems, and things I learn.
      </div>
    </div>,
    size,
  );
}
