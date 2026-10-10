import { afterEach, describe, expect, it, vi } from "vitest";
import {
  articleMetadata,
  articleStructuredData,
  listingMetadata,
  listingPath,
  listingStructuredData,
  missingPageMetadata,
  parseBlogSearch,
} from "../../src/lib/blog/metadata";
import { pageRobots, SITE_URL } from "../../src/lib/seo";
import type { MediaView, Publication } from "../../src/lib/blog/types";
const post: Publication = {
  post_id: "11111111-1111-4111-8111-111111111111",
  slug: "readable-engineering",
  title: "Readable engineering",
  excerpt: "Clear systems and clear writing.",
  body_markdown: "# A heading\nContent",
  tags: ["systems"],
  cover_media_id: null,
  seo_title: "Engineering notes for developers",
  seo_description: "How to explain your system clearly.",
  author_name: "Vishal Jadeja",
  published_at: "2026-10-01T12:00:00Z",
  modified_at: "2026-10-06T12:00:00Z",
  source_version: 2,
  reading_minutes: 3,
};
afterEach(() => vi.unstubAllEnvs());
describe("SEO contracts", () => {
  it("does not advertise canonical/social pages or indexing for missing content", () => {
    expect(missingPageMetadata("Article not found")).toMatchObject({
      title: "Article not found",
      robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
      alternates: { canonical: null },
      openGraph: null,
      twitter: null,
    });
  });
  it("uses publication metadata without inheriting the homepage or draft details", () => {
    const meta = articleMetadata(post);
    expect(meta.title).toBe(post.seo_title);
    expect(meta.description).toBe(post.seo_description);
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/blog/${post.slug}`);
    expect(meta.alternates?.types).toHaveProperty(
      "application/rss+xml",
      `${SITE_URL}/feed.xml`,
    );
    expect(meta.openGraph).toMatchObject({
      type: "article",
      title: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      publishedTime: post.published_at,
      modifiedTime: post.modified_at,
    });
    expect(meta.twitter).toMatchObject({
      title: post.title,
      card: "summary_large_image",
    });
    expect(JSON.stringify(meta.twitter)).toContain(
      `/blog/${post.slug}/twitter-image?v=2`,
    );
    expect(JSON.stringify(meta.openGraph)).toContain(
      `/blog/${post.slug}/opengraph-image?v=2`,
    );
    const updated = articleMetadata({ ...post, source_version: 3 });
    expect(JSON.stringify(updated.openGraph)).toContain("opengraph-image?v=3");
    expect(JSON.stringify(updated.twitter)).toContain("twitter-image?v=3");
    expect(updated.alternates?.canonical).toBe(meta.alternates?.canonical);
  });
  it("uses public cover dimensions, author, publisher and visible dates in structured data", () => {
    const cover: MediaView = {
      id: "cover",
      url: "https://example.com/diagram.webp",
      width: 1600,
      height: 900,
      alt_text: "Architecture",
      caption: "System diagram",
    };
    const graph = articleStructuredData(post, cover)["@graph"];
    expect(graph[0]).toMatchObject({
      "@type": "BlogPosting",
      headline: post.title,
      author: { name: post.author_name, url: SITE_URL },
      publisher: { name: post.author_name },
      image: { url: cover.url, width: 1600, height: 900 },
      datePublished: post.published_at,
      dateModified: post.modified_at,
    });
    expect(graph[1]).toMatchObject({
      "@type": "BreadcrumbList",
      itemListElement: [
        { position: 1, name: "Home" },
        { position: 2, name: "Blog" },
        { position: 3, name: post.title },
      ],
    });
    expect(articleStructuredData(post)["@graph"][0]).toMatchObject({
      image: {
        url: `${SITE_URL}/blog/${post.slug}/opengraph-image?v=2&style=4`,
        width: 1200,
        height: 630,
      },
    });
  });
  it("gives each paginated listing a self-canonical and keeps filters out of search", () => {
    expect(listingMetadata(2, "", true).alternates?.canonical).toBe(
      `${SITE_URL}/blog?page=2`,
    );
    const filtered = listingMetadata(2, "systems", true);
    expect(filtered.alternates?.canonical).toBe(
      `${SITE_URL}/blog?page=2&tag=systems`,
    );
    expect(filtered.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
    expect(listingMetadata(1, "", false).robots).toMatchObject({
      index: false,
    });
    expect(listingPath(1)).toBe("/blog");
    expect(listingPath(1, "c++")).toBe("/blog?tag=c%2B%2B");
  });
  it("rejects invalid and repeated pagination parameters rather than silently creating duplicate content", () => {
    for (const value of ["0", "-1", "1.5", "Infinity", "1e2", "abc", "10001"])
      expect(parseBlogSearch({ page: value }).valid).toBe(false);
    expect(parseBlogSearch({ page: ["1", "2"] }).valid).toBe(false);
    expect(parseBlogSearch({ tag: ["a", "b"] }).valid).toBe(false);
    expect(parseBlogSearch({ tag: "x".repeat(31) }).valid).toBe(false);
    expect(parseBlogSearch({ page: "2", tag: " Systems " })).toEqual({
      page: 2,
      tag: "systems",
      valid: true,
    });
  });
  it("excludes previews/staging for both general crawlers and Googlebot", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(pageRobots()).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
    expect(articleMetadata(post).robots).toMatchObject({
      index: false,
      googleBot: { index: false },
    });
    expect(listingMetadata(1, "systems", true).robots).toMatchObject({
      index: false,
      googleBot: { index: false },
    });
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("SITE_NOINDEX", "true");
    expect(pageRobots()).toMatchObject({ index: false });
    vi.stubEnv("SITE_NOINDEX", "false");
    expect(pageRobots()).toMatchObject({
      index: true,
      googleBot: { index: true },
    });
    expect(pageRobots(false, false)).toMatchObject({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    });
  });
  it("describes crawlable published links in the collection schema", () => {
    const schema = listingStructuredData([post], 2, "", 13);
    expect(schema).toMatchObject({
      "@type": "CollectionPage",
      url: `${SITE_URL}/blog?page=2`,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: 13,
        itemListElement: [
          { position: 13, url: `${SITE_URL}/blog/${post.slug}` },
        ],
      },
    });
  });
});
