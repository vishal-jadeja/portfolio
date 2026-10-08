import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../../src/lib/blog/queries", () => ({ listSitemapEntries: vi.fn() }));
import sitemap from "../../src/app/sitemap";
import { listSitemapEntries } from "../../src/lib/blog/queries";
import { SITE_URL } from "../../src/lib/seo";
import type { Summary } from "../../src/lib/blog/types";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetAllMocks();
});
describe("public sitemap", () => {
  it("omits the noindexed empty blog hub", async () => {
    vi.mocked(listSitemapEntries).mockResolvedValue([]);
    expect((await sitemap()).map((entry) => entry.url)).toEqual([SITE_URL, `${SITE_URL}/projects`, `${SITE_URL}/gears`, `${SITE_URL}/movies`]);
  });
  it("includes the hub and published articles with real modification dates", async () => {
    vi.mocked(listSitemapEntries).mockResolvedValue([
      { slug: "published-note", modified_at: "2026-10-07T06:00:00Z" } as Summary,
    ]);
    expect(await sitemap()).toEqual([
      expect.objectContaining({ url: SITE_URL }),
      expect.objectContaining({ url: `${SITE_URL}/projects` }),
      expect.objectContaining({ url: `${SITE_URL}/gears` }),
      expect.objectContaining({ url: `${SITE_URL}/movies` }),
      expect.objectContaining({ url: `${SITE_URL}/blog` }),
      expect.objectContaining({
        url: `${SITE_URL}/blog/published-note`,
        lastModified: "2026-10-07T06:00:00Z",
      }),
    ]);
  });
  it("does not query or expose articles on a noindexed deployment", async () => {
    vi.stubEnv("SITE_NOINDEX", "true");
    expect(await sitemap()).toEqual([]);
    expect(listSitemapEntries).not.toHaveBeenCalled();
  });
});
