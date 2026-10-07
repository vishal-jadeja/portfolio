import { listPublishedPosts } from "@/lib/blog/queries";
import { xml } from "@/lib/blog/markdown";
import { SITE_URL } from "@/lib/seo";
export const revalidate = 300;
export async function GET() {
  const { posts } = await listPublishedPosts(1, "", 50);
  const items = posts
    .map(
      (p) =>
        `<item><title>${xml(p.title)}</title><link>${xml(`${SITE_URL}/blog/${p.slug}`)}</link><guid isPermaLink="true">${xml(`${SITE_URL}/blog/${p.slug}`)}</guid><description>${xml(p.excerpt)}</description><pubDate>${new Date(p.published_at).toUTCString()}</pubDate><dc:creator>${xml(p.author_name)}</dc:creator><dcterms:modified>${xml(p.modified_at)}</dcterms:modified>${p.tags.map((t) => `<category>${xml(t)}</category>`).join("")}</item>`,
    )
    .join("");
  const latest = posts.reduce(
    (date, post) => (post.modified_at > date ? post.modified_at : date),
    "",
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"><channel><title>Vishal Jadeja — Writing</title><link>${xml(`${SITE_URL}/blog`)}</link><description>Notes on engineering, systems, and things I learn.</description><language>en-us</language>${latest ? `<lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : ""}<atom:link href="${xml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`,
    {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "X-Robots-Tag": "noindex",
        ...(latest ? { "Last-Modified": new Date(latest).toUTCString() } : {}),
      },
    },
  );
}
