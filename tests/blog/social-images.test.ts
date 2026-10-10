import { afterEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
vi.mock("../../src/lib/blog/queries", () => ({ getPublishedPostBySlug: vi.fn(), getPublicMedia: vi.fn() }));
import homeOG from "../../src/app/opengraph-image";
import homeTwitter from "../../src/app/twitter-image";
import blogOG from "../../src/app/blog/opengraph-image";
import blogTwitter from "../../src/app/blog/twitter-image";
import articleOG from "../../src/app/blog/[slug]/opengraph-image";
import articleTwitter from "../../src/app/blog/[slug]/twitter-image";
import projectsOG from "../../src/app/projects/opengraph-image";
import projectsTwitter from "../../src/app/projects/twitter-image";
import moviesOG from "../../src/app/movies/opengraph-image";
import moviesTwitter from "../../src/app/movies/twitter-image";
import gearsOG from "../../src/app/gears/opengraph-image";
import gearsTwitter from "../../src/app/gears/twitter-image";
import { getPublishedPostBySlug, getPublicMedia } from "../../src/lib/blog/queries";
import type { Publication, MediaView } from "../../src/lib/blog/types";

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
afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });

const cover: MediaView = {
  id: "22222222-2222-4222-8222-222222222222",
  url: "https://example.com/cover.webp", width: 1600, height: 900,
  alt_text: "Article cover", caption: null,
};
async function mockCover(title = post.title) {
  const image = await sharp({ create: { width: 1600, height: 900, channels: 3, background: "#be3020" } }).webp().toBuffer();
  vi.mocked(getPublishedPostBySlug).mockResolvedValue({ ...post, title, cover_media_id: cover.id });
  vi.mocked(getPublicMedia).mockResolvedValue([cover]);
  vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array(image), { headers: { "Content-Type": "image/webp" } })));
}

describe("social card rendering", () => {
  it("renders matching OG/Twitter PNGs for every public page and article", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(post);
    const cards = [
      [await homeOG(), await homeTwitter()],
      [await blogOG(), await blogTwitter()],
      [await projectsOG(), await projectsTwitter()],
      [await moviesOG(), await moviesTwitter()],
      [await gearsOG(), await gearsTwitter()],
      [await articleOG(params()), await articleTwitter(params())],
    ];
    for (const [og, twitter] of cards) {
      expect((await png(og)).equals(await png(twitter))).toBe(true);
    }
  });
  it("uses the full published cover as matching OG and Twitter cards without cropping", async () => {
    await mockCover();
    const og = await png(await articleOG(params()));
    const twitter = await png(await articleTwitter(params()));
    expect(og.equals(twitter)).toBe(true);
    expect(getPublicMedia).toHaveBeenCalledWith(post.post_id);
    // A 16:9 cover fits at 1120×630, leaving only 40px side bars.
    for (const left of [45, 600, 1135]) {
      const pixel = await sharp(og).extract({ left, top: 5, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
      expect(pixel[0]).toBeGreaterThan(170);
      expect(pixel[1]).toBeLessThan(65);
    }
    const background = await sharp(og).extract({ left: 20, top: 20, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect(Math.max(...background)).toBeLessThanOrEqual(16);
  });
  it("preserves the edges of portrait covers rather than cropping their content", async () => {
    await mockCover();
    const image = await sharp({ create: { width: 400, height: 800, channels: 3, background: "#be3020" } })
      .composite([{ input: await sharp({ create: { width: 400, height: 40, channels: 3, background: "#20be30" } }).png().toBuffer(), left: 0, top: 0 }])
      .webp().toBuffer();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(new Uint8Array(image))));
    const bytes = await png(await articleOG(params()));
    const top = await sharp(bytes).extract({ left: 600, top: 5, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect(top[1]).toBeGreaterThan(170);
    expect(top[0]).toBeLessThan(65);
    const bottom = await sharp(bytes).extract({ left: 600, top: 625, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    expect(bottom[0]).toBeGreaterThan(170);
    expect(bottom[1]).toBeLessThan(65);
  });
  it("keeps a readable dark text card when the cover cannot be fetched", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(post);
    const fallback = await png(await articleOG(params()));
    await mockCover();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Image unavailable")));
    expect((await png(await articleOG(params()))).equals(fallback)).toBe(true);
  });
  it.each(["HTTP error", "invalid image"])("falls back to text for an unusable cover: %s", async (failure) => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(post);
    const fallback = await png(await articleOG(params()));
    await mockCover();
    vi.stubGlobal("fetch", vi.fn(async () => failure === "HTTP error"
      ? new Response(null, { status: 404 })
      : new Response("not an image")));
    for (const render of [articleOG, articleTwitter]) {
      expect((await png(await render(params()))).equals(fallback)).toBe(true);
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
      expect(channels.every((channel) => channel.max <= 16)).toBe(true);
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
