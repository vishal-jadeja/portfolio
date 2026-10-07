import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("../../src/lib/blog/queries", () => ({ getPublishedPostBySlug: vi.fn() }));
import homeOG from "../../src/app/opengraph-image";
import homeTwitter from "../../src/app/twitter-image";
import blogOG from "../../src/app/blog/opengraph-image";
import blogTwitter from "../../src/app/blog/twitter-image";
import articleOG from "../../src/app/blog/[slug]/opengraph-image";
import articleTwitter from "../../src/app/blog/[slug]/twitter-image";
import { getPublishedPostBySlug } from "../../src/lib/blog/queries";
import type { Publication } from "../../src/lib/blog/types";

const post: Publication = {
  post_id: "11111111-1111-4111-8111-111111111111",
  slug: "card-test", title: "Readable engineering", excerpt: "Clear systems.",
  body_markdown: "## Notes\nUseful content.", tags: [], cover_media_id: null,
  seo_title: null, seo_description: null, author_name: "Vishal Jadeja",
  published_at: "2026-10-01T12:00:00Z", modified_at: "2026-10-01T12:00:00Z",
  source_version: 1, reading_minutes: 3,
};
const params = () => ({ params: Promise.resolve({ slug: post.slug }) });
async function png(response: Response) {
  expect(response.headers.get("content-type")).toContain("image/png");
  const bytes = Buffer.from(await response.arrayBuffer());
  expect(bytes.length).toBeLessThan(5_000_000);
  expect(await sharp(bytes).metadata()).toMatchObject({ format: "png", width: 1200, height: 630 });
  return bytes;
}
afterEach(() => vi.resetAllMocks());

describe("social card rendering", () => {
  it("renders matching OG/Twitter PNGs for the homepage, blog and article", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(post);
    const cards = [
      [homeOG(), homeTwitter()],
      [blogOG(), blogTwitter()],
      [await articleOG(params()), await articleTwitter(params())],
    ];
    for (const [og, twitter] of cards) {
      expect((await png(og)).equals(await png(twitter))).toBe(true);
    }
  });
  it.each([
    "Building scalable backend systems with WebSockets, event-driven architecture, reliable database transactions, and resilient high-performance APIs in production",
    "W".repeat(160),
  ])("keeps a long title inside the card padding: %.30s", async (title) => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue({ ...post, title });
    const bytes = await png(await articleOG(params()));
    for (const crop of [
      { left: 1140, top: 130, width: 40, height: 370 },
      { left: 80, top: 585, width: 1040, height: 30 },
    ]) {
      // Materialize the crop: sharp.stats() otherwise reads the original input.
      const cropped = await sharp(bytes).removeAlpha().extract(crop).toBuffer();
      const { channels } = await sharp(cropped).stats();
      expect(channels.every((channel) => channel.min >= 248)).toBe(true);
    }
  });
  it("does not render a card for an unpublished or missing article", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(null);
    for (const render of [articleOG, articleTwitter]) {
      const response = await render(params());
      expect(response.status).toBe(404);
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });
});
