import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  listingMetadata,
  listingStructuredData,
  parseBlogSearch,
  listingPath,
  PAGE_SIZE,
  type BlogSearch,
} from "@/lib/blog/metadata";
import { safeJson } from "@/lib/blog/markdown";
import PostList from "@/components/blog/PostList";
import { listPublishedPosts } from "@/lib/blog/queries";
import { blogConfigured } from "@/lib/config/blog-env";
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<BlogSearch>;
}): Promise<Metadata> {
  const { page, tag, valid } = parseBlogSearch(await searchParams);
  if (!valid) return listingMetadata(page, tag, false);
  const { posts } = await listPublishedPosts(page, tag);
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
  const href = (p: number) => listingPath(p, tag);
  return (
    <>
      <div className="blog-index-intro">
        <span className="blog-eyebrow">Notes & ideas</span>
        <h1>Writing.</h1>
        <p>On engineering, systems, and things I learn along the way.</p>
        <a className="blog-text-link" href="/feed.xml">
          Subscribe via RSS ↗
        </a>
      </div>
      {tag && (
        <div className="blog-filter">
          Tagged “{tag}” <Link href="/blog">Clear filter ×</Link>
        </div>
      )}
      {posts.length ? (
        <PostList posts={posts} />
      ) : (
        <div className="blog-empty">
          <h2>
            {tag || page > 1
              ? "No articles here yet."
              : "A little quiet, for now."}
          </h2>
          <p>
            {!blogConfigured()
              ? "The writing space is taking shape. Check back soon."
              : "New articles will appear here when they’re published."}
          </p>
        </div>
      )}
      <nav className="blog-pagination" aria-label="Article pages">
        {page > 1 && (
          <>
            <Link href={href(page - 1)}>← Previous</Link>
            <Link href="/blog">All articles</Link>
          </>
        )}
        {total > page * PAGE_SIZE && <Link href={href(page + 1)}>Next →</Link>}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJson(listingStructuredData(posts, page, tag, total)),
        }}
      />
    </>
  );
}
