import Link from "next/link";
import Image from "next/image";
import PostHoverCard from "./PostHoverCard";
import { categoryLabel } from "@/lib/blog/categories";
import type { Summary } from "@/lib/blog/types";
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export default function PostList({ posts }: { posts: Summary[] }) {
  return (
    <div className="blog-post-list">
      {posts.map((post) => (
        <PostHoverCard key={post.post_id}>
          <h2>
            <Link className="blog-post-title-link" href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p>{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  {categoryLabel(tag)}
                </Link>
              ))}
            </div>
          )}
          <div className="blog-meta">
            <time dateTime={post.published_at}>
              <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M16 3v4M8 3v4M3 11h18M7 15h2M12 15h2M7 18h2" />
              </svg>
              {formatDate(post.published_at)}
            </time>
          </div>
          <span className="blog-post-read-more" aria-hidden="true">Read more →</span>
          {post.cover_media_id && (
            <span className="blog-post-cover" aria-hidden="true">
              <Image
                src={`/blog/${post.slug}/cover?v=${post.source_version}`}
                alt=""
                width={1200}
                height={630}
                sizes="300px"
                unoptimized
              />
            </span>
          )}
        </PostHoverCard>
      ))}
    </div>
  );
}
