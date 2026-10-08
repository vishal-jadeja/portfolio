"use client";

import Link, { useLinkStatus } from "next/link";

function LinkFeedback() {
  const { pending } = useLinkStatus();
  return (
    <>
      All articles
      <span className={pending ? "blog-link-spinner" : "blog-link-arrow"} aria-hidden="true">{pending ? "" : "→"}</span>
      <span className="sr-only" role="status">{pending ? "Loading articles" : ""}</span>
    </>
  );
}

export default function AllArticlesLink() {
  return (
    <Link href="/blog" prefetch className="blog-text-link blog-all-articles">
      <LinkFeedback />
    </Link>
  );
}
