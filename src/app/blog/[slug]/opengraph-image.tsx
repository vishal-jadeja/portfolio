import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog/queries";
export const alt = "Article by Vishal Jadeja";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 300;
export const dynamic = "force-static";
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
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
          display: "flex",
          fontSize: post.title.length > 90 ? 48 : 62,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: -2,
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
