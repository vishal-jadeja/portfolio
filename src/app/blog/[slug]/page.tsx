import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPublishedPostBySlug,
  getPublicMedia,
  getRelatedPosts,
} from "@/lib/blog/queries";
import ArticleBody, { ArticleImage } from "@/components/blog/ArticleBody";
import ShareBar from "@/components/blog/ShareBar";
import ReadingProgress from "@/components/blog/ReadingProgress";
import PostList, { formatDate } from "@/components/blog/PostList";
import { inspectMarkdown, safeJson } from "@/lib/blog/markdown";
import { highlightMarkdown } from "@/lib/blog/highlight";
import { SITE_URL } from "@/lib/seo";
import {
  articleMetadata,
  articleStructuredData,
  missingPageMetadata,
} from "@/lib/blog/metadata";
export const revalidate = 300;
export const dynamic = "force-static";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return missingPageMetadata("Article not found");
  return articleMetadata(post);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();
  const [media, related, highlights] = await Promise.all([
    getPublicMedia(post.post_id),
    getRelatedPosts(post),
    highlightMarkdown(post.body_markdown),
  ]);
  const cover = media.find((m) => m.id === post.cover_media_id);
  const headings = inspectMarkdown(post.body_markdown).headings.filter(
    (h) => h.depth <= 3,
  );
  const url = `${SITE_URL}/blog/${slug}`;
  const schema = articleStructuredData(post, cover);
  return (
    <>
      <Link href="/blog" className="blog-back">
        ← All writing
      </Link>
      <article className="blog-reading-article">
        {cover && (
          <div className="blog-cover">
            <ArticleImage media={cover} preload />
          </div>
        )}
        <header className="blog-article-header">
          <h1>{post.title}</h1>
          <p className="blog-deck">{post.excerpt}</p>
          <div className="blog-meta">
            <span>{post.author_name}</span>
            <span>·</span>
            <time dateTime={post.published_at}>
              {formatDate(post.published_at)}
            </time>
            <span>·</span>
            <span>{post.reading_minutes} min read</span>
          </div>
          {post.modified_at !== post.published_at && (
            <p className="blog-updated">
              Updated{" "}
              <time dateTime={post.modified_at}>
                {formatDate(post.modified_at)}
              </time>
            </p>
          )}
        </header>

        {headings.length >= 3 && (
          <details className="blog-toc">
            <summary>In this article</summary>
            <ol>
              {headings.map((h) => (
                <li
                  key={h.id}
                  className={h.depth === 3 ? "blog-toc-sub" : undefined}
                >
                  <a href={`#${h.id}`}>{h.title}</a>
                </li>
              ))}
            </ol>
          </details>
        )}
        <ArticleBody
          markdown={post.body_markdown}
          media={media}
          highlights={highlights}
        />
        <div className="blog-tags">
          {post.tags.map((tag) => (
            <Link href={`/blog?tag=${encodeURIComponent(tag)}`} key={tag}>
              {tag}
            </Link>
          ))}
        </div>
        <ShareBar url={url} title={post.title} />
      </article>
      {related.length > 0 && (
        <section className="blog-related">
          <h2>Keep reading</h2>
          <PostList posts={related} />
        </section>
      )}
      <ReadingProgress headings={headings} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJson(schema) }}
      />
    </>
  );
}
