import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_cache: vi.fn() }));
vi.mock("../../src/lib/supabase/public", () => ({ publicClient: vi.fn() }));
vi.mock("../../src/lib/config/blog-env", () => ({
  blogConfigured: vi.fn(), blogEnv: vi.fn(),
}));
import { listPublishedSlugs } from "../../src/lib/blog/queries";
import { publicClient } from "../../src/lib/supabase/public";
import { blogConfigured } from "../../src/lib/config/blog-env";

const range = vi.fn();
const query = { select: vi.fn(), order: vi.fn(), range };
const from = vi.fn();
beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(blogConfigured).mockReturnValue(true);
  query.select.mockReturnValue(query);
  query.order.mockReturnValue(query);
  from.mockReturnValue(query);
  vi.mocked(publicClient).mockReturnValue({ from } as unknown as ReturnType<typeof publicClient>);
});

describe("build-time article inventory", () => {
  it("allows builds before blog setup without contacting a database", async () => {
    vi.mocked(blogConfigured).mockReturnValue(false);
    expect(await listPublishedSlugs()).toEqual([]);
    expect(publicClient).not.toHaveBeenCalled();
  });
  it("allows an empty published blog", async () => {
    range.mockResolvedValue({ data: [], error: null });
    expect(await listPublishedSlugs()).toEqual([]);
    expect(from).toHaveBeenCalledWith("blog_publications");
    expect(query.select).toHaveBeenCalledWith("slug");
  });
  it("enumerates every published slug beyond a database page limit", async () => {
    const first = Array.from({ length: 500 }, (_, index) => ({ slug: `article-${index}` }));
    const last = [{ slug: "last-article" }];
    range.mockResolvedValueOnce({ data: first, error: null });
    range.mockResolvedValueOnce({ data: last, error: null });
    expect(await listPublishedSlugs()).toEqual([...first, ...last]);
    expect(range.mock.calls).toEqual([[0, 499], [500, 999]]);
    expect(query.order).toHaveBeenCalledWith("slug");
  });
  it("fails a build on database errors instead of silently prerendering a partial inventory", async () => {
    range.mockResolvedValueOnce({
      data: Array.from({ length: 500 }, (_, index) => ({ slug: `article-${index}` })),
      error: null,
    });
    range.mockResolvedValueOnce({ data: null, error: { message: "Unavailable" } });
    await expect(listPublishedSlugs()).rejects.toThrow("Unable to load published article slugs");
  });
});
