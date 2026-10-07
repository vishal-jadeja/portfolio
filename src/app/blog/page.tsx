import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listingMetadata,
  missingPageMetadata,
  listingStructuredData,
  parseBlogSearch,
  listingPath,
  PAGE_SIZE,
  type BlogSearch,
} from "@/lib/blog/metadata";
import { safeJson } from "@/lib/blog/markdown";
import PostList from "@/components/blog/PostList";
import EmptyWriting from "@/components/blog/EmptyWriting";
import { listPublishedPosts } from "@/lib/blog/queries";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BlogSearch>;
}): Promise<Metadata> {
  const { page, tag, valid } = parseBlogSearch(await searchParams);
  if (!valid) return missingPageMetadata();
  const { posts } = await listPublishedPosts(page, tag);
  if (page > 1 && !posts.length) return missingPageMetadata();
  return listingMetadata(page, tag, posts.length > 0);
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<BlogSearch>;
}) {
  const { page, tag, valid } = parseBlogSearch(await searchParams);
  if (!valid) notFound();
  const { posts, total } = await listPublishedPosts(page, tag);
  if (page > 1 && !posts.length) notFound();
  const emptyWriting = !tag && total === 0 && posts.length === 0;
  const href = (p: number) => listingPath(p, tag);
  return (
    <div className={`blog-listing${emptyWriting ? " blog-listing--empty" : ""}`}>
      <div className="blog-index-intro">
        <span className="blog-eyebrow">Notes & ideas</span>
        <h1>Writing.</h1>
        <p>On engineering, systems, and the things I learn along the way.</p>
        {!emptyWriting && (
          <a className="blog-text-link" href="/feed.xml">
            Subscribe via RSS ↗
          </a>
        )}
      </div>
      {tag && (
        <div className="blog-filter">
          Tagged “{tag}” <Link href="/blog">Clear filter ×</Link>
        </div>
      )}
      {posts.length ? (
        <PostList posts={posts} />
      ) : emptyWriting ? (
        <EmptyWriting />
      ) : (
        <div className="blog-empty">
          <h2>No articles match this tag.</h2>
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
