import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
vi.mock("../../src/lib/blog/queries", () => ({
  getPublishedPostBySlug: vi.fn(), getPublicMedia: vi.fn(), getRelatedPosts: vi.fn(), listPublishedSlugs: vi.fn(),
}));
vi.mock("../../src/lib/blog/highlight", () => ({ highlightMarkdown: vi.fn().mockResolvedValue({}) }));
import ArticlePage from "../../src/app/blog/[slug]/page";
import { getPublishedPostBySlug, getPublicMedia, getRelatedPosts } from "../../src/lib/blog/queries";
import type { Publication } from "../../src/lib/blog/types";

const post: Publication = {
  post_id: "11111111-1111-4111-8111-111111111111", slug: "published-note",
  title: "A published note", excerpt: "Real article content.", tags: [],
  body_markdown: "A useful note.", cover_media_id: null, seo_title: null, seo_description: null,
  author_name: "Vishal Jadeja", published_at: "2026-10-01T12:00:00Z",
  modified_at: "2026-10-01T12:00:00Z", reading_minutes: 2, source_version: 1,
};
afterEach(() => vi.resetAllMocks());
describe("article discussion and recommendations", () => {
  it.each([true, false])("places comments after the article and before related reading (related: %s)", async (hasRelated) => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(post);
    vi.mocked(getPublicMedia).mockResolvedValue([]);
    vi.mocked(getRelatedPosts).mockResolvedValue(hasRelated ? [{ ...post, post_id: "related", slug: "related-note" }] : []);
    const html = renderToStaticMarkup(await ArticlePage({ params: Promise.resolve({ slug: post.slug }) }));
    // The visual fade must also render on the server for articles without headings.
    expect(html).toContain('class="blog-bottom-blur" aria-hidden="true"');
    expect(html).toContain('aria-labelledby="comments-heading"');
    expect(html).toContain("Coming soon");
    const articleEnd = html.indexOf("</article>");
    const comments = html.indexOf('id="comments-heading"');
    expect(comments).toBeGreaterThan(articleEnd);
    expect(html.slice(articleEnd, comments)).toContain("<hr");
    if (hasRelated) {
      const related = html.indexOf("Keep reading");
      expect(related).toBeGreaterThan(comments);
      expect(html.slice(comments, related)).toContain("<hr");
    } else {
      expect(html).not.toContain("Keep reading");
    }
  });
});
