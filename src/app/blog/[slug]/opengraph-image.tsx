import { ImageResponse } from "next/og";
import { getPublishedPostBySlug, listPublishedSlugs } from "@/lib/blog/queries";
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
  return new ImageResponse(
    <div
      style={{
        background: "#fafafa",
        color: "#18181b",
        padding: "70px 80px",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        border: "1px solid #e4e4e7",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#71717a" }}>
        VJ / writing
      </div>
      <div
        style={{
          display: "block",
          width: "100%",
          // The editor accepts 160 characters, including a single long token.
          // Leave room for the byline even at the maximum title length.
          fontSize: post.title.length > 120 ? 42 : post.title.length > 70 ? 48 : 62,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: -2,
          wordBreak: "break-word",
        }}
      >
        {post.title}
      </div>
      <div style={{ display: "flex", fontSize: 25, color: "#71717a" }}>
        {post.author_name} · {post.reading_minutes} min read
      </div>
    </div>,
    size,
  );
}
