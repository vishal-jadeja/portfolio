# Website SEO audit — 7 October 2026

## Production observations

- The homepage returns 200 with its canonical production URL, index/follow directives, and profile/website structured data.
- HTTP and the bare hostname redirect permanently to `https://www.vishaljadeja.xyz/`.
- The four live homepage/blog OG and Twitter endpoints return valid 1200×630 PNGs. Both platform images match for each page and were visually inspected.
- The live blog has no published articles and correctly uses noindex/follow. Its deployed sitemap still includes the empty hub; this is corrected locally.
- There are no live article URLs in the deployed sitemap. Article metadata, images, publication updates, and unpublishing were checked with isolated local content, without modifying production.

## Changes

- Homepage canonical, indexing, and social metadata now belong to the homepage. Unknown/private routes no longer inherit its canonical URL or index/follow directives.
- Invalid pagination and missing articles use explicit noindex metadata without canonical/social page URLs.
- Article image URLs include the published snapshot version. A draft save retains the public version; publication changes the URL so social crawlers can fetch the updated image.
- Long unbroken article titles wrap within the social card. OG and Twitter share the same rendering and image dimensions.
- An empty, noindexed blog hub is excluded from the sitemap until an article is published. The homepage advertises RSS, and robots exclusions cover the exact `/admin` path as well as its children.
- Homepage animation styles have a no-JavaScript visibility fallback.
- The empty writing hub has a responsive, theme-aware editorial panel. Filters and loading errors remain separate states; only the unpublished hub hides the prominent RSS CTA.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.

The 34 unit/integration tests cover content/database/media behavior, metadata, sitemap contents, listing states, matching PNG output for all six social-card variants, card boundaries for long titles, and missing-article image behavior. PNG checks render directly with `next/og` and inspect the images with Sharp. No browser test dependency is required.

Layout inspection covers desktop and narrow mobile sizes in both themes, including the panel's 540px breakpoint. The notebook is decorative and absent from the accessibility tree; headings, navigation, theme control, portfolio link, and footer remain accessible.

These changes are local and have not been deployed. After deployment, verify the sitemap and a real published article in Search Console. Search Console verification, indexing status, third-party card caches, and field Core Web Vitals require production/account checks.
