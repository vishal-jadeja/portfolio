import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("../../src/lib/blog/queries", () => ({ listPublishedPosts: vi.fn() }));
import BlogPage from "../../src/app/blog/page";
import { listPublishedPosts } from "../../src/lib/blog/queries";
import type { Summary } from "../../src/lib/blog/types";

afterEach(() => vi.resetAllMocks());
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
  it("keeps filtered no-results separate from an unpublished blog", async () => {
    vi.mocked(listPublishedPosts).mockResolvedValue({ posts: [], total: 0 });
    const html = renderToStaticMarkup(await BlogPage({ searchParams: Promise.resolve({ tag: "systems" }) }));
    expect(html).toContain("No articles match this tag.");
    expect(html).toContain("Clear filter");
    expect(html).toContain("Subscribe via RSS");
    expect(html).not.toContain("blog-listing--empty");
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
