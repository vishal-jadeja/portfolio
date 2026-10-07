import { test, expect } from "@playwright/test";
const article = "/blog/a-quieter-place-to-write";
test("article HTML, metadata, code, mobile layout, sharing, themes and feed", async ({
  page,
  request,
}) => {
  const response = await request.get(article);
  expect(response.status()).toBe(200);
  const html = await response.text();
  expect(html).toContain("Building a quieter place to write");
  expect(html).toContain('property="og:type" content="article"');
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(article);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Building a quieter place to write",
  );
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByText("In this article", { exact: true }).click();
  await expect(
    page.getByRole("link", { name: "The implementation", exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(page.locator("html")).toHaveClass("dark");
  await page.screenshot({
    path: "test-results/article-mobile-dark.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole("button", { name: "Switch to light theme" }).click();
  await page.screenshot({
    path: "test-results/article-desktop-light.png",
    fullPage: true,
    animations: "disabled",
  });
  const rss = await request.get("/feed.xml");
  expect(await rss.text()).toContain("a-quieter-place-to-write");
  const sitemap = await request.get("/sitemap.xml");
  expect(await sitemap.text()).toContain("a-quieter-place-to-write");
  const card = await request.get(`${article}/opengraph-image`);
  expect(card.status()).toBe(200);
  expect(card.headers()["content-type"]).toContain("image/png");
  const missing = await request.get("/blog/no-such-article");
  expect(missing.status()).toBe(404);
});
test("owner can create, import, upload, publish, edit privately and unpublish", async ({
  page,
  context,
  request,
}) => {
  const session = await (
    await request.get("http://127.0.0.1:54329/fixture/session")
  ).json();
  await context.addCookies([
    {
      ...session,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
  await page.goto("/admin/blog");
  await expect(
    page.getByRole("heading", { name: "Your writing." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New article +" }).click();
  await expect(page).toHaveURL(/\/edit$/);
  await page.getByLabel("Title", { exact: true }).fill("A test of publication");
  await page
    .getByLabel("Description", { exact: true })
    .fill("A complete author workflow.");
  await page.getByRole("button", { name: "Generate from title" }).click();
  await page
    .getByLabel("Article (Markdown)")
    .fill(
      "## Introduction\n\nOriginal public body.\n\n## Code\n\n```typescript\nconst reliable = true;\n```",
    );
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator('input[type="file"][accept=".md"]').setInputFiles({
    name: "workflow.md",
    mimeType: "text/markdown",
    buffer: Buffer.from(
      "---\ntitle: A test of publication\nslug: a-test-of-publication\nexcerpt: A complete author workflow.\ntags: [engineering]\n---\n\n## Introduction\n\nOriginal public body.",
    ),
  });
  await expect(page.getByRole("status")).toContainText("Imported as a draft");
  await page
    .getByLabel("Alt text", { exact: true })
    .fill("A sample engineering diagram");
  const image = await (
    await request.get("http://127.0.0.1:54329/fixture/image")
  ).body();
  await page
    .locator('input[type="file"][accept="image/jpeg,image/png,image/webp"]')
    .setInputFiles({
      name: "diagram.png",
      mimeType: "image/png",
      buffer: image,
    });
  await expect(page.getByRole("status")).toContainText("Image uploaded", {
    timeout: 30000,
  });
  await page.getByRole("button", { name: "Insert", exact: true }).click();
  await page.getByLabel("Cover image").selectOption({ index: 1 });
  await page.screenshot({
    path: "test-results/studio-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Published.", {
    timeout: 30000,
  });
  const first = await request.get("/blog/a-test-of-publication");
  const firstHtml = await first.text();
  expect(firstHtml).toContain("Original public body.");
  expect(firstHtml).toContain('alt="A sample engineering diagram"');
  expect(firstHtml).toContain('as="image"');
  await page
    .getByLabel("Article (Markdown)")
    .fill("## Introduction\n\nPrivate revised body.");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Saved");
  expect(
    await (await request.get("/blog/a-test-of-publication")).text(),
  ).toContain("Original public body.");
  await page.getByRole("button", { name: "Publish updates" }).click();
  await expect(page.getByRole("status")).toContainText("Published.");
  expect(
    await (await request.get("/blog/a-test-of-publication")).text(),
  ).toContain("Private revised body.");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Unpublish", exact: true }).click();
  await expect(page).toHaveURL("/admin/blog");
  expect((await request.get("/blog/a-test-of-publication")).status()).toBe(404);
});
test("anonymous studio access redirects and article remains readable without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:3100${article}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.goto("http://127.0.0.1:3100/admin/blog");
  await expect(page).toHaveURL(/\/admin\/login$/);
  const mutation = await request.post("/api/admin/blog/media/upload-url", {
    data: {},
  });
  expect(mutation.status()).toBe(400);
  await context.close();
});

test("reading controls navigate sections, remain keyboard accessible, and respect reduced motion", async ({
  page,
}) => {
  await page.goto(article);
  const button = page.getByRole("button", {
    name: "Open article sections",
    exact: true,
  });
  await expect(button).toBeVisible();
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await page
    .locator(".blog-reading-menu")
    .getByRole("link", { name: "The implementation", exact: true })
    .click();
  await expect(page).toHaveURL(/#the-implementation$/);
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await button.click();
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  expect(
    await page
      .locator("h1")
      .evaluate((element) => getComputedStyle(element).fontWeight),
  ).toBe("400");
  expect(
    await page
      .locator(".blog-header")
      .evaluate((element) => getComputedStyle(element).backdropFilter),
  ).toContain("blur");
  expect(
    await button.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    ),
  ).toBe("0s");
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe("auto");
  await page.setViewportSize({ width: 360, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
