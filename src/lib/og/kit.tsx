import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import { SITE_URL } from "@/lib/seo";

/** Shared building blocks for every social card, so they read as one family. */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_TYPE = "image/png";

export const C = {
  bg: "#0a0a0a",
  card: "#121212",
  border: "#222222",
  text: "#ededed",
  muted: "#8a8a8a",
  faint: "#5c5c5c",
  accent: "#FFE600",
};

export const DOMAIN = SITE_URL.replace(/^https?:\/\/(www\.)?/, "");

type Font = { name: string; data: Buffer; weight: 400 | 500 | 700; style: "normal" };

// Literal paths so Next's file tracing bundles them with runtime-rendered cards.
let assets: Promise<{ fonts: Font[]; avatar: string }> | undefined;
function loadAssets() {
  assets ??= Promise.all([
    readFile(join(process.cwd(), "src/lib/og/assets/DMSans-Regular.ttf")),
    readFile(join(process.cwd(), "src/lib/og/assets/DMSans-Medium.ttf")),
    readFile(join(process.cwd(), "src/lib/og/assets/DMSans-Bold.ttf")),
    readFile(join(process.cwd(), "src/lib/og/assets/JetBrainsMono-Regular.ttf")),
    readFile(join(process.cwd(), "src/lib/og/assets/avatar.png")),
  ]).then(([regular, medium, bold, mono, avatar]) => ({
    fonts: [
      { name: "DM Sans", data: regular, weight: 400 as const, style: "normal" as const },
      { name: "DM Sans", data: medium, weight: 500 as const, style: "normal" as const },
      { name: "DM Sans", data: bold, weight: 700 as const, style: "normal" as const },
      { name: "JetBrains Mono", data: mono, weight: 400 as const, style: "normal" as const },
    ],
    avatar: `data:image/png;base64,${avatar.toString("base64")}`,
  }));
  return assets;
}

export async function avatarSrc() {
  return (await loadAssets()).avatar;
}

/**
 * Satori cannot decode WebP, so site images are re-encoded as JPEG data URLs.
 * Returns null when the file is missing so a card never fails to render.
 */
export async function publicImage(path: string, width: number, height: number) {
  try {
    const file = await readFile(join(process.cwd(), "public", path.replace(/^\/+/, "")));
    const jpeg = await sharp(file).resize(width * 2, height * 2, { fit: "cover", position: "top" }).jpeg({ quality: 78 }).toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch {
    return null;
  }
}

export async function renderCard(node: React.ReactElement) {
  const { fonts } = await loadAssets();
  return new ImageResponse(node, { ...OG_SIZE, fonts });
}

/** Full-bleed dark canvas with the site's faint top-left glow. */
export function Canvas({ children, padding = 72 }: { children: React.ReactNode; padding?: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: C.bg,
        backgroundImage: "radial-gradient(900px 520px at 12% 0%, rgba(255,255,255,0.07), rgba(255,255,255,0) 70%)",
        color: C.text,
        fontFamily: "DM Sans",
        padding,
      }}
    >
      {children}
    </div>
  );
}

/** Avatar · name / section on the left, domain on the right — the site's navbar, condensed. */
export function PageHeader({ avatar, section }: { avatar: string; section: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img>. */}
        <img src={avatar} width={52} height={52} style={{ borderRadius: 999, border: `2px solid ${C.border}` }} alt="" />
        <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: C.text }}>Vishal Jadeja</div>
        <div style={{ display: "flex", fontSize: 24, color: C.faint, fontFamily: "JetBrains Mono" }}>/ {section}</div>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: C.muted, fontFamily: "JetBrains Mono" }}>{DOMAIN}</div>
    </div>
  );
}

/** Large page title with the short yellow rule used under section headings. */
export function PageTitle({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 700, letterSpacing: -2.5, lineHeight: 1 }}>{title}</div>
      <div style={{ display: "flex", width: 56, height: 5, background: C.accent, marginTop: 22, borderRadius: 3 }} />
      <div style={{ display: "flex", marginTop: 22, fontSize: 28, color: C.muted, lineHeight: 1.4, maxWidth: 940 }}>{description}</div>
    </div>
  );
}
