import { getPublishedPostBySlug, getPublicMedia } from "@/lib/blog/queries";
import { articleImageUrl } from "@/lib/blog/metadata";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  const media = post.cover_media_id ? await getPublicMedia(post.post_id) : [];
  const cover = media.find((item) => item.id === post.cover_media_id);
  // Use the original cover: social cards already contain letterboxing.
  return new Response(null, {
    status: 307,
    headers: {
      Location: cover?.url ?? articleImageUrl(post),
      "Cache-Control": "no-store",
    },
  });
}
