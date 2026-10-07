# Blog SEO

The blog's search behavior is built into the publishing and rendering system. No SEO plugin or manual metadata file is required per article.

## What happens automatically

- Each article uses its own title, description, canonical URL, author, publication/update dates, Open Graph metadata, and Twitter card. Optional editor SEO fields override the search title/description; share cards retain the visible article title and excerpt.
- Homepage canonical/social metadata belongs to the homepage, so missing and private pages do not inherit its canonical URL or indexing directives. RSS discovery also appears on the homepage.
- OG and Twitter cards use matching 1200×630 PNGs. Article titles wrap within the card, including long unbroken words. Published article card URLs include the snapshot version so publishing an update changes the share-image URL; draft saves do not.
- Metadata renders in the initial HTML head for all user agents. Article content and internal links render on the server and remain readable without JavaScript.
- `BlogPosting` structured data includes author/publisher, canonical page, original publication date, modification date, article image/dimensions, language, and tags. Breadcrumbs describe Home → Blog → Article. This follows the fields described in [Google's Article structured-data documentation](https://developers.google.com/search/docs/appearance/structured-data/article). Schema describes real published content; it never includes draft bodies.
- Blog listings have collection/list structured data and crawlable previous/next links. Each pagination page canonicalizes to itself. Filtered listings use `noindex, follow`, and invalid or out-of-range page numbers return 404. This follows [Google's pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading).
- Sitemap entries include only published article URLs with real modification dates. The empty, noindexed blog hub is omitted until the first article is published. New publication, updates, and unpublishing expire article, social-image, homepage, listing, sitemap, and RSS caches together.
- RSS is discoverable through HTML alternate links. It includes article authors, publication/modification dates, and an accurate channel update date. The feed response uses `noindex` so the XML document does not compete with articles.
- Article titles use one H1; a Markdown `#` heading renders as H2 in the body. Uploaded images require alt text and retain intrinsic dimensions; cover images preload, and other images can load lazily. Fonts are self-hosted. These improve accessibility and avoid preventable layout/loading costs; field performance must still be measured after launch.
- Portfolio animation styles have a no-JavaScript fallback so the homepage's name, biography, experience, projects, skills, and contact content remain visible.
- Admin/preview/auth responses have private caching and `noindex` headers. They require authorization where appropriate. Robots exclusions supplement this access control.
- Vercel non-production deployments and deployments with `SITE_NOINDEX=true` use both general and Googlebot noindex metadata, global noindex headers, and an empty public sitemap. Crawlable public staging pages allow crawlers to see the noindex directive. [Google explains why a noindex page must remain crawlable](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag).

The metadata helpers are in `src/lib/blog/metadata.ts`. Shared environment indexing rules are in `src/lib/search-indexing.ts`.

## Static generation and publication

Existing published articles and their OG/Twitter cards are generated at build time with `generateStaticParams`. The build enumerates only public publication snapshots, in batches, so drafts stay private and large blogs are not truncated by a database response limit. A configured database error fails the build rather than producing an incomplete inventory. An unconfigured or empty blog returns an empty inventory.

New slugs remain available after deployment: the first request generates their HTML or card, then subsequent requests use the cached result. Publishing, updating, unpublishing, and the studio's Refresh public pages action immediately expire the public data tags and relevant paths. The next request regenerates the affected output; no deploy hook or full rebuild is required. This also clears a previously cached 404 when its slug is first published.

Missing social images return an explicit 404 response with `Cache-Control: no-store`. This lets Next.js retain the route's invalidation tags, avoiding an untagged cached 404 that could otherwise survive first publication.

The fallback revalidation interval is one day (86,400 seconds), shared by public query caches, article/card routes, RSS, and the sitemap. It is request-driven recovery for a missed invalidation, not a scheduled job or a publishing delay. If invalidation fails, the studio reports a warning and provides a retry; regeneration failures can retain cached output, so the interval is not a guaranteed removal deadline.

The blog listing remains server-rendered per request because its pagination and tag filters use query parameters; its data is cached and refreshed by the same publication events. The homepage is prerendered and also invalidated by publication. Private admin pages remain dynamic.

## Writing for search

Use a specific, descriptive title and an excerpt that accurately explains the article. Use section headings that organize the argument, descriptive links, and image alt text that explains the actual image. Write original useful content and link to relevant existing articles. Use the optional search overrides when the visible title or excerpt is unsuitable for a search snippet. No hard snippet character count guarantees how a search engine displays a result.

Slugs lock after first publication, preserving shared and indexed URLs. Updates retain the original publication date and expose a separate modification date. Unpublishing returns a real 404 for fresh article requests; already-cached third-party cards or public images may remain available.

## Deployment and verification

1. Set `NEXT_PUBLIC_SITE_URL` to the intended canonical production origin. Configure the hosting provider to redirect alternate hostnames/protocols to that origin. Keep previews excluded from indexing and connected to test data. Ensure production does not have `SITE_NOINDEX=true` or a non-production `VERCEL_ENV`.
2. Publish a real article and inspect its live page source: title, description, canonical, robots, social card URLs, JSON-LD, and visible dates should describe that article. Fetch both image endpoints and verify their PNG responses.
3. In Google Search Console, verify the production site and submit `/sitemap.xml`. For URL-prefix verification using an HTML token, optionally set `GOOGLE_SITE_VERIFICATION` to the exact token Google supplies and redeploy; the root metadata emits it. Domain verification requires the provider's DNS setup. Account verification and sitemap submission are external setup steps, not actions performed by this implementation.
4. Validate a live article with Google's Rich Results Test, inspect its URL in Search Console, and monitor indexing and Core Web Vitals after deployment. Automated local tests cannot establish live rankings, indexing, hosting redirects, or field performance.

## Automated checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

SEO unit tests cover custom title/description, versioned social images, article/collection schemas, canonical pagination, tag/no-result indexing, invalid/repeated query parameters, staging indexing rules, and sitemap contents. Inspect initial-head metadata, PNG responses, and publication cache changes directly against a production build when changing rendering or publishing behavior.

The static-generation checks also cover an empty/unconfigured blog, paginated slug enumeration, and database failures during the build. Production verification against the isolated database confirmed 13 prebuilt article pages and 26 social cards with a one-day fallback, first publication after cached 404s, private draft isolation, published updates, discovery/related-link refresh, and unpublishing both prebuilt and runtime-generated output. These checks use direct HTTP requests and the real publishing actions, without browser automation or production data.

See the [website SEO audit](seo-audit.md) for current findings. Live Search Console verification requires account access.
