import { describe, expect, it } from "vitest";
import BlogsAlias from "../../src/app/blogs/page";
describe("plural blog listing alias", () => {
  it("redirects to the canonical listing while retaining the selected category and page", async () => {
    await expect(BlogsAlias({ searchParams: Promise.resolve({ page: "2", tag: "AI" }) }))
      .rejects.toMatchObject({ digest: "NEXT_REDIRECT;replace;/blog?page=2&tag=ai;308;" });
  });
  it("rejects invalid parameters instead of redirecting to misleading content", async () => {
    await expect(BlogsAlias({ searchParams: Promise.resolve({ page: ["1", "2"] }) }))
      .rejects.toMatchObject({ digest: "NEXT_HTTP_ERROR_FALLBACK;404" });
  });
});
