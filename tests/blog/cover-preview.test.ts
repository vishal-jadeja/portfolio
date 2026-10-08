import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("../../src/lib/blog/queries", () => ({ getPublishedPostBySlug: vi.fn(), getPublicMedia: vi.fn() }));
import { GET } from "../../src/app/blog/[slug]/cover/route";
import { getPublishedPostBySlug, getPublicMedia } from "../../src/lib/blog/queries";
import type { Publication } from "../../src/lib/blog/types";

const request = new Request("http://localhost/blog/sample/cover");
const params = { params: Promise.resolve({ slug: "sample" }) };
beforeEach(() => vi.resetAllMocks());

describe("blog hover cover", () => {
  it("uses the original published cover rather than its letterboxed social image", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue({ post_id: "post", cover_media_id: "cover", slug: "sample", source_version: 1 } as Publication);
    vi.mocked(getPublicMedia).mockResolvedValue([{ id: "cover", url: "https://example.test/original.webp", width: 400, height: 800, alt_text: "Cover", caption: "" }]);
    const response = await GET(request, params);
    expect(response.status).toBe(307);
    expect(response.headers.get("Location")).toBe("https://example.test/original.webp");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("does not return cover images for unpublished posts", async () => {
    vi.mocked(getPublishedPostBySlug).mockResolvedValue(null);
    expect((await GET(request, params)).status).toBe(404);
    expect(getPublicMedia).not.toHaveBeenCalled();
  });
});
