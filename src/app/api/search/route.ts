import { listSitemapEntries } from "@/lib/blog/queries";
import { blogSearchEntries } from "@/lib/search/blog-entries";
// Next.js requires a literal here; match BLOG_REVALIDATE_SECONDS.
export const revalidate = 86400;
/** Published blog content for the site search. Static entries ship in the client bundle. */
export async function GET() {
  const entries = blogSearchEntries(await listSitemapEntries());
  return Response.json(
    { entries },
    { headers: { "X-Robots-Tag": "noindex" } },
  );
}
