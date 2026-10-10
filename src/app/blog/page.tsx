import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  listingMetadata,
  missingPageMetadata,
  parseBlogSearch,
  type BlogSearch,
} from "@/lib/blog/metadata";
import BlogListing from "@/components/blog/BlogListing";
import BlogLoading from "@/components/blog/BlogLoading";
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
  // Check before the skeleton streams: once it does, the status is locked at 200.
  if (page > 1 && !(await listPublishedPosts(page, tag)).posts.length) notFound();
  return (
    <Suspense fallback={<BlogLoading />}>
      <BlogListing page={page} tag={tag} />
    </Suspense>
  );
}
