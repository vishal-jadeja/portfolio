import { test, expect } from "@playwright/test";
test("staging pages and social endpoints consistently prohibit indexing", async ({
  request,
}) => {
  for (const path of [
    "/",
    "/blog",
    "/blog?tag=design",
    "/blog/a-quieter-place-to-write",
    "/blog/opengraph-image",
    "/blog/a-quieter-place-to-write/twitter-image",
  ]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()["x-robots-tag"]).toContain("noindex");
    if (!path.includes("image")) {
      const html = await response.text();
      expect(html).toMatch(/<meta name="robots" content="noindex, nofollow"/);
      expect(html).toMatch(/<meta name="googlebot" content="noindex, nofollow/);
    }
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toContain("<url>");
});
