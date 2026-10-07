import "server-only";
import { unstable_cache } from "next/cache";
import { publicClient } from "@/lib/supabase/public";
import { blogConfigured, blogEnv } from "@/lib/config/blog-env";
import type { Publication, Summary, MediaView } from "./types";
import { BLOG_REVALIDATE_SECONDS } from "./cache-policy";
const summaryColumns =
  "post_id,slug,title,excerpt,tags,cover_media_id,seo_title,seo_description,author_name,published_at,modified_at,reading_minutes,source_version";

/** Enumerate public snapshots for build-time generation, including large blogs. */
export async function listPublishedSlugs(): Promise<{ slug: string }[]> {
  if (!blogConfigured()) return [];
  const client = publicClient();
  const slugs: { slug: string }[] = [];
  // Do not persist this inventory across deployments. Drafts are never queried.
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from("blog_publications")
      .select("slug")
      .order("slug")
      .range(offset, offset + 499);
    if (error || !data)
      throw new Error("Unable to load published article slugs for prerendering.");
    slugs.push(...data);
    if (data.length < 500) return slugs;
  }
}

export function listPublishedPosts(page = 1, tag = "", size = 12) {
  if (!blogConfigured())
    return Promise.resolve({ posts: [] as Summary[], total: 0 });
  return unstable_cache(
    async () => {
      let query = publicClient()
        .from("blog_publications")
        .select(summaryColumns, { count: "exact" })
        .order("published_at", { ascending: false })
        .order("post_id", { ascending: false });
      if (tag) query = query.contains("tags", [tag]);
      const { data, error, count } = await query.range(
        (page - 1) * size,
        page * size - 1,
      );
      if (error) throw new Error("Unable to load articles. Please try again.");
      return { posts: data as Summary[], total: count ?? 0 };
    },
    ["blog-list", String(page), tag, String(size)],
    { tags: ["blog:posts"], revalidate: BLOG_REVALIDATE_SECONDS },
  )();
}
export function getPublishedPostBySlug(slug: string) {
  if (
    !blogConfigured() ||
    slug.length > 120 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
  )
    return Promise.resolve(null);
  return unstable_cache(
    async () => {
      const { data, error } = await publicClient()
        .from("blog_publications")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error("Unable to load this article.");
      return data as Publication | null;
    },
    ["blog-article", slug],
    { tags: ["blog:posts", `blog:slug:${slug}`], revalidate: BLOG_REVALIDATE_SECONDS },
  )();
}
export function getPublicMedia(postId: string) {
  return unstable_cache(
    async () => {
      const { data, error } = await publicClient()
        .from("blog_public_media")
        .select("*")
        .eq("post_id", postId);
      if (error) throw new Error("Unable to load article images.");
      return (data ?? []).map((m) => ({
        id: m.id,
        url: `${blogEnv().url}/storage/v1/object/public/blog-public/${m.public_object_path}`,
        width: m.width,
        height: m.height,
        alt_text: m.alt_text,
        caption: m.caption,
      })) as MediaView[];
    },
    ["blog-media", postId],
    { tags: ["blog:posts", `blog:post:${postId}`], revalidate: BLOG_REVALIDATE_SECONDS },
  )();
}
export async function getRelatedPosts(post: Publication) {
  let matches: Summary[] = [];
  if (post.tags.length) {
    const { data, error } = await publicClient()
      .from("blog_publications")
      .select(summaryColumns)
      .overlaps("tags", post.tags)
      .neq("post_id", post.post_id)
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) throw new Error("Unable to load related articles.");
    matches = data as Summary[];
  }
  if (matches.length < 3) {
    const { posts } = await listPublishedPosts(1, "", 6);
    for (const candidate of posts)
      if (
        candidate.post_id !== post.post_id &&
        !matches.some((m) => m.post_id === candidate.post_id) &&
        matches.length < 3
      )
        matches.push(candidate);
  }
  return matches;
}
export async function listSitemapEntries() {
  if (!blogConfigured()) return [] as Summary[];
  return unstable_cache(
    async () => {
      const client = publicClient();
      const all: Summary[] = [];
      for (let offset = 0; ; offset += 500) {
        const { data, error } = await client
          .from("blog_publications")
          .select(summaryColumns)
          .order("post_id")
          .range(offset, offset + 499);
        if (error)
          throw new Error("Unable to generate published article feed.");
        all.push(...(data as Summary[]));
        if (data.length < 500) break;
      }
      return all;
    },
    ["blog-sitemap"],
    { tags: ["blog:posts"], revalidate: BLOG_REVALIDATE_SECONDS },
  )();
}
