import { test, expect } from "@playwright/test";
const origin = "http://127.0.0.1:3100";
const article = "/blog/a-quieter-place-to-write";
function head(html: string) {
  const value = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  expect(value).toBeTruthy();
  return value!;
}
function meta(html: string, name: string) {
  return html.match(
    new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`),
  )?.[1];
}
function schema(html: string) {
  const json = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
  )?.[1];
  expect(json).toBeTruthy();
  return JSON.parse(json!);
}

test("article metadata is in the initial head for normal browsers and crawlers", async ({
  request,
  page,
}) => {
  for (const userAgent of [
    "Mozilla/5.0",
    "Googlebot",
    "Twitterbot/1.0",
    "LinkedInBot/1.0",
  ]) {
    const html = await (
      await request.get(article, { headers: { "User-Agent": userAgent } })
    ).text();
    const initial = head(html);
    expect(initial).toContain(
      "<title>Quiet writing: engineering notes · Vishal Jadeja</title>",
    );
    expect(meta(initial, "description")).toBe(
      "How clear design and reliable publishing make technical writing easier.",
    );
    expect(initial).toContain(`rel="canonical" href="${origin}${article}"`);
    expect(initial).toContain('type="application/rss+xml"');
    expect(meta(initial, "og:type")).toBe("article");
    expect(meta(initial, "og:title")).toBe("Building a quieter place to write");
    expect(meta(initial, "og:url")).toBe(`${origin}${article}`);
    expect(meta(initial, "og:image")).toContain(`${article}/opengraph-image`);
    expect(meta(initial, "twitter:image")).toContain(
      `${article}/twitter-image`,
    );
    expect(meta(initial, "twitter:title")).toBe(
      "Building a quieter place to write",
    );
    expect(meta(initial, "robots")).toContain("index, follow");
    expect(meta(initial, "robots")).not.toContain("noindex");
    const graph = schema(html)["@graph"];
    expect(graph[0]).toMatchObject({
      "@type": "BlogPosting",
      author: { name: "Vishal Jadeja" },
      publisher: { name: "Vishal Jadeja" },
      mainEntityOfPage: { "@id": `${origin}${article}` },
      image: { width: 1200, height: 630 },
    });
    expect(graph[1]).toMatchObject({ "@type": "BreadcrumbList" });
  }
  await page.goto(article);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h2#a-small-beginning")).toBeVisible();
  const twitter = await request.get(`${article}/twitter-image`);
  expect(twitter.status()).toBe(200);
  expect(twitter.headers()["content-type"]).toContain("image/png");
});

test("listing, pagination and filters have distinct metadata and crawlable links", async ({
  page,
  request,
}) => {
  const first = head(await (await request.get("/blog")).text());
  expect(meta(first, "twitter:title")).toBe("Blog · Vishal Jadeja");
  expect(meta(first, "twitter:image")).toContain("/blog/twitter-image");
  await page.goto("/blog");
  await expect(page.getByRole("link", { name: "Next →" })).toHaveAttribute(
    "href",
    "/blog?page=2",
  );
  const second = await request.get("/blog?page=2");
  expect(second.status()).toBe(200);
  const html = await second.text();
  const initial = head(html);
  expect(initial).toContain(`rel="canonical" href="${origin}/blog?page=2"`);
  expect(meta(initial, "og:url")).toBe(`${origin}/blog?page=2`);
  expect(meta(initial, "robots")).not.toContain("noindex");
  expect(schema(html)).toMatchObject({
    "@type": "CollectionPage",
    mainEntity: { "@type": "ItemList", numberOfItems: 13 },
  });
  const filtered = head(await (await request.get("/blog?tag=design")).text());
  expect(meta(filtered, "robots")).toContain("noindex");
  expect(meta(filtered, "googlebot")).toContain("noindex");
  expect(filtered).toContain(
    `rel="canonical" href="${origin}/blog?tag=design"`,
  );
  const empty = head(await (await request.get("/blog?tag=not-present")).text());
  expect(meta(empty, "robots")).toContain("noindex");
  for (const path of [
    "/blog?page=3",
    "/blog?page=0",
    "/blog?page=abc",
    "/blog?page=1&page=2",
  ]) {
    const missing = await request.get(path);
    expect(missing.status()).toBe(404);
    expect(meta(head(await missing.text()), "robots")).toContain("noindex");
  }
});

test("private routes stay out of search and published discovery is complete", async ({
  request,
}) => {
  const privatePage = await request.get("/admin/login");
  expect(privatePage.headers()["x-robots-tag"]).toContain("noindex");
  const initial = head(await privatePage.text());
  expect(meta(initial, "robots")).toContain("noindex");
  expect(meta(initial, "googlebot")).toContain("noindex");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Disallow: /admin/");
  expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  const xml = await (await request.get("/sitemap.xml")).text();
  expect((xml.match(/<url>/g) ?? []).length).toBe(15);
  expect(xml).toContain("pagination-note-1");
  expect(xml).not.toContain("/admin/");
  const feed = await request.get("/feed.xml");
  expect(feed.headers()["x-robots-tag"]).toBe("noindex");
  expect(feed.headers()["last-modified"]).toBeTruthy();
  const rss = await feed.text();
  expect(rss).toContain("<dc:creator>Vishal Jadeja</dc:creator>");
  expect(rss).toContain("<dcterms:modified>");
});
