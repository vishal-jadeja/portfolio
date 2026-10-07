# Blog setup and operations

The application implementation is in this repository. No production database, account, or deployment was changed. Use Node 22+ and `npm install`.

## Connect Supabase

1. Use a development Supabase project first. Copy `.env.local.example` to `.env.local` and set the public project URL, publishable key, server-only secret, and site URL. The public URL must be HTTPS for hosted images. Never put the secret in a `NEXT_PUBLIC_*` variable. The blog does not require chatbot credentials.
2. Apply `supabase/migrations/202610060001_blog.sql` to that project, through the Supabase SQL editor or a configured Supabase CLI (`supabase db push`). After applying schema changes, regenerate TypeScript types with `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts`. The checked-in types match this migration. It creates the blog tables, RLS, constrained functions, and private `blog-drafts` / public `blog-public` buckets. Do not blindly rerun the migration against an existing schema. The migration is verified by the local PostgreSQL integration tests.
3. In Supabase Auth, disable new user signup, create/invite the owner, and look up that user's UUID. Add that UUID with a controlled SQL operation:

   ```sql
   insert into public.blog_admins(user_id) values ('YOUR_AUTH_USER_UUID');
   ```

   App users cannot add themselves to the owner table. Being authenticated alone does not authorize editing.
4. Set Auth Site URL to the deployed site. Add allowed callback URLs: `http://localhost:3000/auth/callback`, the production `/auth/callback`, and any explicitly approved test preview hostname. Set up SMTP/email delivery and provider rate limits. This app uses PKCE magic links, which should be opened in the same browser that requested them. Invalid/expired links return to sign-in.
5. Verify the bucket privacy, sizes, and MIME lists created by the migration. If buckets already existed, compare their configuration manually: `blog-drafts` must be private, `blog-public` must be public. No general authenticated storage-write policy is needed; upload capabilities come from verified server requests.
6. Run `npm run dev`, open `/admin/login`, and use the owner's email. Create a real draft, upload an image, preview, and publish. New posts appear at `/blog/<slug>` without redeploying.

When no blog environment is configured, the public blog displays its empty state and the studio explains setup. When a configured database fails, queries produce an error state rather than silently hiding articles.

## Authoring

Write Markdown in the studio, with the toolbar and live preview. The separate Preview action saves first and opens the owner-only page with server code highlighting. Markdown imports must be `.md`, UTF-8, ≤500KB, with optional YAML fields `title`, `slug`, `excerpt`/`description`, `tags`, `seo_title`, `seo_description`. Executable MDX, HTML, and unknown frontmatter fields are unsupported.

Every imported image must be uploaded or mapped. Images use stable `media:UUID` references. Upload supports non-animated JPEG/PNG/WebP up to 5MB/20 megapixels; normalized images have a maximum edge of 2400px. Alt text is required. Draft preview URLs last one hour; reload the editor/preview to refresh. Supabase signed upload tokens use the provider's default validity (currently two hours); each token targets one reserved path. Reservations, type/byte validation, and persisted per-owner/draft limits constrain abuse.

Autosave shows Saving/Saved/Failed. Conflicts require exporting the local editor text and reloading; stale versions cannot overwrite newer content. Slugs lock after first publication. Draft edits do not replace the public snapshot until Publish updates succeeds. The first publication date is retained after unpublishing/republication.

Unpublish removes public article records and explicitly expires page/data/feed/image metadata caches. Public image URLs can remain accessible after unpublishing, and third-party social caches cannot be recalled. Archive is recoverable and also unpublishes. No permanent deletion is exposed.

If a commit succeeds but public cache expiration fails, the studio displays the saved state and a warning. Use Refresh public pages to retry. Time-based cache refresh is a recovery aid, not a guaranteed content-removal deadline. If Vercel's cache cannot be invalidated, verify the database state and invalidate/redeploy through the hosting provider as needed.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run test:e2e:production
npm run test:e2e:preview
```

The unit/integration tests run against an embedded PostgreSQL engine using the actual migration plus simulated Supabase roles/UIDs. They cover RLS, private drafts, version conflicts, slug uniqueness, snapshot publication/update/unpublication, retry behavior, archive/restore, and upload reservations. Supabase Auth, Storage signing, actual email delivery, and live hosting caches still need verification against the configured development project. Browser tests run locally against an isolated Supabase-shaped HTTP fixture backed by the actual SQL. They exercise the real app and image validator without connecting to production. Production-mode browser tests also build and serve the app locally to check caching and real 404s.

The production build uses Next.js’s supported Webpack builder; Turbopack builds stalled in the restricted local environment. Development can still use Turbopack. Locally hosted licensed fonts remove Google Fonts network access from builds. Optional chatbot services validate their settings on use instead of blocking blog builds.

## Local verification completed

On 6 October 2026: production build, lint, and TypeScript checks passed; 21 content/database/image/origin/SEO tests passed; seven production browser checks and a staging-indexing browser check passed. The original three author/reading workflows also passed in development mode. Article and studio screenshots were visually reviewed. The browser backend is isolated test infrastructure, so live Supabase email/auth/storage settings and production hosting still require the deployment checks below.

## Deploy

Configure production Vercel variables from the example. Apply the migration and provision the production owner separately. Do not copy production write credentials to an untrusted preview deployment; use a test Supabase project for previews. Preview pages use noindex metadata. Deploy using the existing portfolio process.

After deploying, verify `/blog`, a real article, `/feed.xml`, `/sitemap.xml`, and `/blog/<slug>/opengraph-image`. Verify anonymous draft/private image access is denied. Publish, edit privately, update, and unpublish a test article while requesting its previously cached URL. Check code, tables, images, theme, keyboard access, and sharing on mobile and desktop. Publication prepares up to 50 media assets sequentially; monitor request time against the hosting plan's function limit. A timeout can be retried safely; promote durable jobs if measured limits require it.

## Backups, cleanup, rollback

The editor exports current Markdown (including unsaved text). Export saved draft downloads a JSON backup containing all draft fields and the media manifest, including temporary authorized image URLs. Download the files within one hour and keep them with the manifest. For a complete collection, use `npm run blog:backup -- --output /path/to/backup` with server environment set. That command saves all drafts/publications/media metadata plus normalized and original image files privately to disk. Do not commit backups; they contain private drafts.

Supabase database backups alone do not include storage image bytes. Schedule database and storage backups according to the account plan. To restore a single post through the studio, use the Markdown fields from the export, reupload its saved media, and map old `media:UUID` references to the new uploads before publishing. Restoring a complete original database/storage backup preserves media IDs and publication records. Sample a backup restore in a test project before relying on it.

`npm run blog:cleanup` previews expired failed/pending upload reservations. Run with `--apply` only after reviewing the list. The command atomically claims only unreferenced failed/pending reservations older than seven days, deletes their storage objects, then deletes their metadata. It never deletes ready/published media or article content. Storage deletion failures retain failed reservations for retry.

Application rollback should keep the additive blog schema and content. Avoid dropping tables or buckets. Log request/post IDs and failure stages, never credentials or unpublished article bodies. Monitor 5xx responses, publish/validation failures, database latency, storage/egress usage, and image optimization costs. Account quotas and email delivery configuration determine real operating capacity.

## Reference material

- [Architecture plan](blog-architecture-plan.md)
- [Supabase SSR auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework)
- [Next.js cache invalidation](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)

## SEO

See [blog SEO behavior and deployment checks](blog-seo.md) for canonical URLs, crawl/indexing rules, metadata, structured data, staging controls, and Search Console setup.

## Sample preview

Run `npm run blog:preview` for a local demo, or `npm run blog:preview -- --production` for a production build. Open `http://127.0.0.1:3101/blog/building-a-quieter-place-to-write`. The preview uses an isolated in-memory database and generated images, never production credentials. Ctrl+C stops it; relaunching restores the sample. The Markdown source is in `examples/blog/building-a-quieter-place-to-write.md`.

The public reading layout takes typography and glass-effect inspiration from https://ramx.in/blog/cursor-code-indexing: Playfair Display / Hanken Grotesk, an 840px shell shared with the homepage, a frosted sticky header, and a floating section/progress control. Reduced-motion settings disable smooth scrolling and animated control transitions.

The homepage retains its original DM Sans typography and palette. Blog and studio styles are scoped to their own layout using Playfair Display headings and Hanken Grotesk text, with the updated light/dark palette.

Contributions opens on GitHub by default. The homepage and public blog share the 840px maximum width and themed side borders.
