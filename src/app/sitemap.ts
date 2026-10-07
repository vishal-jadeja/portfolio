import type { MetadataRoute } from "next";
import { SITE_URL, isIndexableEnvironment } from "@/lib/seo";
import { listSitemapEntries } from "@/lib/blog/queries";
export const revalidate = 300;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexableEnvironment()) return [];
  const posts = await listSitemapEntries();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    // An empty writing hub is noindexed; only advertise it once published.
    ...(posts.length
      ? [{
          url: `${SITE_URL}/blog`,
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }]
      : []),
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.modified_at,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
