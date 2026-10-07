import Link from "next/link";
import Image from "next/image";
import { articleImageUrl } from "@/lib/blog/metadata";
import type { Summary } from "@/lib/blog/types";
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
export default function PostList({ posts }: { posts: Summary[] }) {
  return (
    <div className="blog-post-list">
      {posts.map((post) => (
        <article key={post.post_id} className="blog-post-row">
          <h2>
            <Link className="blog-post-title-link" href={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <p>{post.excerpt}</p>
          {post.tags.length > 0 && (
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          )}
          <div className="blog-meta">
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
            <span>·</span>
            <span>{post.reading_minutes} min read</span>
          </div>
          <span className="blog-post-read-more" aria-hidden="true">Read more →</span>
          {post.cover_media_id && (
            <span className="blog-post-cover" aria-hidden="true">
              <Image
                src={articleImageUrl(post)}
                alt=""
                width={1200}
                height={630}
                sizes="192px"
                unoptimized
              />
            </span>
          )}
        </article>
      ))}
    </div>
  );
}
