import Link from "next/link";
import {
  listingStructuredData,
  listingPath,
  PAGE_SIZE,
} from "@/lib/blog/metadata";
import { safeJson } from "@/lib/blog/markdown";
import PostList from "./PostList";
import EmptyWriting from "./EmptyWriting";
import CategoryFilters from "./CategoryFilters";
import { categoryLabel } from "@/lib/blog/categories";
import { listPublishedPosts, listSitemapEntries } from "@/lib/blog/queries";

export default async function BlogListing({
  page,
  tag,
}: {
  page: number;
  tag: string;
}) {
  const [{ posts, total }, inventory] = await Promise.all([
    listPublishedPosts(page, tag),
    listSitemapEntries(),
  ]);
  const emptyWriting = !tag && total === 0 && posts.length === 0;
  const href = (p: number) => listingPath(p, tag);
  return (
    <div className={`blog-listing${emptyWriting ? " blog-listing--empty" : ""}`}>
      <div className="blog-index-intro">
        <h1 className="section-title">Blog</h1>
        <p className="section-description">On engineering, systems, and the things I learn along the way.</p>
      </div>
      {!emptyWriting && <CategoryFilters posts={inventory} active={tag} />}
      {tag && (
        <div className="blog-filter">
          Category: {categoryLabel(tag)} <Link href="/blog">Clear filter ×</Link>
        </div>
      )}
      {posts.length ? (
        <PostList posts={posts} />
      ) : emptyWriting ? (
        <EmptyWriting />
      ) : (
        <div className="blog-empty">
          <h2>No articles match this category.</h2>
          <p>Try another topic, or explore all articles.</p>
        </div>
      )}
      {!emptyWriting && (
        <nav className="blog-pagination" aria-label="Article pages">
          {page > 1 && (
            <>
              <Link href={href(page - 1)}>← Previous</Link>
              <Link href="/blog">All articles</Link>
            </>
          )}
          {total > page * PAGE_SIZE && <Link href={href(page + 1)}>Next →</Link>}
        </nav>
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson(listingStructuredData(posts, page, tag, total)),
        }}
      />
    </div>
  );
}
