import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("../../src/lib/blog/queries", () => ({ listPublishedPosts: vi.fn(), listSitemapEntries: vi.fn() }));
import BlogPage from "../../src/app/blog/page";
import { listPublishedPosts, listSitemapEntries } from "../../src/lib/blog/queries";
import type { Summary } from "../../src/lib/blog/types";

afterEach(() => vi.resetAllMocks());
beforeEach(() => vi.mocked(listSitemapEntries).mockResolvedValue([]));
describe("blog listing states", () => {
  it("renders the writing empty state only after a successful zero-count result", async () => {
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [], total: 0 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain("blog-listing--empty");
    expect(html).toContain("A little quiet, for now.");
    expect(html).toContain("No articles published yet.");
    expect(html).toContain('href="/projects"');
    expect(html).toContain('class="blog-notebook" aria-hidden="true"');
    expect(html).toContain("Engineering / Systems / Learning");
    expect(html).not.toContain("Subscribe via RSS");
    expect(html).not.toContain('aria-label="Article pages"');
  });
  it("preserves a populated listing and its RSS link", async () => {
    const post: Summary = {
      post_id: "11111111-1111-4111-8111-111111111111", slug: "published-note",
      title: "A published note", excerpt: "Real article content.", tags: ["systems"],
      cover_media_id: null, seo_title: null, seo_description: null,
      author_name: "Vishal Jadeja", published_at: "2026-10-01T12:00:00Z",
      modified_at: "2026-10-01T12:00:00Z", reading_minutes: 2, source_version: 1,
    };
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [post], total: 1 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('href="/blog/published-note"');
    expect(html).toContain("Subscribe via RSS");
    expect(html).not.toContain("blog-empty-writing");
  });
  it("shows a cover preview only for articles with a selected cover", async () => {
    const post: Summary = {
      post_id: "11111111-1111-4111-8111-111111111111", slug: "published-note",
      title: "A published note", excerpt: "Real article content.", tags: ["ai"],
      cover_media_id: "22222222-2222-4222-8222-222222222222", seo_title: null, seo_description: null,
      author_name: "Vishal Jadeja", published_at: "2026-10-01T12:00:00Z",
      modified_at: "2026-10-01T12:00:00Z", reading_minutes: 2, source_version: 4,
    };
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [post], total: 1 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('class="blog-post-cover" aria-hidden="true"');
    expect(html).toContain('/blog/published-note/opengraph-image?v=4');
    expect(html).toContain("Read more");
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [{ ...post, cover_media_id: null }], total: 1 });
    const withoutCover = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({}) }));
    expect(withoutCover).not.toContain('class="blog-post-cover"');
  });
  it("keeps filtered no-results separate from an unpublished blog", async () => {
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [], total: 0 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ tag: "systems" }) }));
    expect(html).toContain("No articles match this category.");
    expect(html).toContain("Clear filter");
    expect(html).toContain("Subscribe via RSS");
    expect(html).not.toContain("blog-listing--empty");
  });
  it("shows category counts from all published posts and resets pagination when switching", async () => {
    const inventory = [
      { post_id: "one", tags: ["ai", "personal"] },
      { post_id: "two", tags: ["ai"] },
      { post_id: "three", tags: ["engineering"] },
    ] as Summary[];
    vi.mocked(listSitemapEntries).mockResolvedValue(inventory);
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [], total: 0 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ tag: "ai" }) }));
    expect(html).toContain('aria-label="Blog categories"');
    expect(html).toMatch(/<a(?=[^>]*href="\/blog\?tag=ai")(?=[^>]*aria-current="page")[^>]*>/);
    expect(html).toContain('href="/blog?tag=personal"');
    expect(html).not.toContain('href="/blog?page=');
    expect(html).toMatch(/All\s*<span[^>]*>3<\/span>/);
    expect(html).toMatch(/AI\s*<span[^>]*>2<\/span>/);
    expect(html).toMatch(/Personal\s*<span[^>]*>1<\/span>/);
  });
  it("does not infer an unpublished blog from an empty page with a nonzero count", async () => {
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [], total: 13 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({}) }));
    expect(html).not.toContain("blog-listing--empty");
  });
  it("propagates loading failures to the existing error boundary", async () => {
    vi.mocked(listPublishedPosts).mockRejectedValue(new Error("Unable to load articles."));
    await expect(BlogPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("Unable to load articles.");
  });
});
