import { ImageResponse } from "next/og";
import sharp from "sharp";
import { getPublishedPostBySlug, getPublicMedia, listPublishedSlugs } from "@/lib/blog/queries";
export const alt = "Article by Vishal Jadeja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
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
  let coverImage: string | undefined;
  if (cover) {
    try {
      const response = await fetch(cover.url, {
        signal: AbortSignal.timeout(5000),
        next: { revalidate: 86400, tags: ["blog:posts", `blog:post:${post.post_id}`] },
      });
      if (response.ok) {
        // Published assets are WebP. Embed a compact JPEG for the OG renderer.
        const image = await sharp(Buffer.from(await response.arrayBuffer()))
          .resize(944, 708, { fit: "cover" })
          .flatten({ background: "#101010" })
          .jpeg({ quality: 88 })
          .toBuffer();
        coverImage = `data:image/jpeg;base64,${image.toString("base64")}`;
      }
    } catch {
      // An unavailable image must not prevent the article from being shared.
    }
  }
  return new ImageResponse(
    <div
      style={{
        background: "#101010",
        color: "#ededed",
        padding: "64px",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #282828",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#999999" }}>
        VJ / writing
      </div>
      <div
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 40,
        }}
      >
        <div
          style={{
            display: "block",
            width: coverImage ? 560 : "100%",
            // Keep 160-character titles readable, even with an adjacent cover.
            fontSize: coverImage
              ? post.title.length > 120 ? 30 : post.title.length > 70 ? 36 : 48
              : post.title.length > 120 ? 42 : post.title.length > 70 ? 48 : 62,
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: -1.5,
            wordBreak: "break-word",
          }}
        >
          {post.title}
        </div>
        {coverImage && (
          // ImageResponse needs a plain image element rather than next/image.
          <img
            src={coverImage}
            alt=""
            width={472}
            height={354}
            style={{ objectFit: "cover", borderRadius: 16 }}
          />
        )}
      </div>
      <div style={{ display: "flex", fontSize: 25, color: "#999999" }}>
        {post.author_name} · {post.reading_minutes} min read
      </div>
    </div>,
    size,
  );
}
