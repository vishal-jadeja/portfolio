import sharp from "sharp";
import { getPublishedPostBySlug, getPublicMedia, listPublishedSlugs } from "@/lib/blog/queries";
import { C, Canvas, OG_SIZE, OG_TYPE, PageHeader, avatarSrc, renderCard } from "@/lib/og/kit";
export const alt = "Article by Vishal Jadeja";
export const size = OG_SIZE;
export const contentType = OG_TYPE;

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
// Next.js requires a literal here; match BLOG_REVALIDATE_SECONDS.
export const revalidate = 86400;
export const dynamic = "force-static";
export async function generateStaticParams() {
  return listPublishedSlugs();
}
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  // Return normally so Next records the route's cache tags. Throwing notFound()
  // here can cache an untagged 404 that first publication cannot invalidate.
  if (!post) return new Response(null, {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
  const media = post.cover_media_id ? await getPublicMedia(post.post_id) : [];
  const cover = media.find((image) => image.id === post.cover_media_id);
  if (cover) {
    try {
      const response = await fetch(cover.url, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 86400, tags: ["blog:posts", `blog:post:${post.post_id}`] },
      });
      if (response.ok) {
        // Keep the entire cover visible, including text and diagrams at its edges.
        // Convert published WebP assets to a PNG for social crawlers.
        const image = await sharp(Buffer.from(await response.arrayBuffer()))
          .resize(size.width, size.height, {
            fit: "contain",
            background: "#101010",
          })
          .flatten({ background: "#101010" })
          .png()
          .toBuffer();
        return new Response(new Uint8Array(image), {
          headers: { "Content-Type": contentType },
        });
      }
    } catch {
      // An unavailable image must not prevent the article from being shared.
    }
  }
  const avatar = await avatarSrc();
  const meta = [date.format(new Date(post.published_at)), `${post.reading_minutes} min read`, ...post.tags.slice(0, 2).map((t) => `#${t}`)];
  return renderCard(
    <Canvas padding={64}>
      <PageHeader avatar={avatar} section="blog" />
      <div
        style={{
          display: "block",
          marginTop: "auto",
          marginBottom: "auto",
          // Keep 160-character titles readable in the fallback card.
          fontSize: post.title.length > 120 ? 42 : post.title.length > 70 ? 50 : 64,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: -1.5,
          wordBreak: "break-word",
          maxWidth: 1040,
        }}
      >
        {post.title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 22, color: C.muted, fontFamily: "JetBrains Mono" }}>
        <div style={{ display: "flex", width: 40, height: 4, background: C.accent, borderRadius: 2, marginRight: 6 }} />
        {meta.join("  ·  ")}
      </div>
    </Canvas>,
  );
}
