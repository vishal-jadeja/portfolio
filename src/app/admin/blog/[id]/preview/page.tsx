import Link from "next/link";
import { notFound } from "next/navigation";
import { getDraft, getDraftMedia } from "@/lib/blog/admin";
import ArticleBody, { ArticleImage } from "@/components/blog/ArticleBody";
import { highlightMarkdown } from "@/lib/blog/highlight";
export default async function Preview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) notFound();
  const [media, highlights] = await Promise.all([
    getDraftMedia(id),
    highlightMarkdown(draft.body_markdown),
  ]);
  const cover = media.find((m) => m.id === draft.cover_media_id);
  return (
    <>
      <div className="blog-preview-banner">
        Private preview · Saved draft only ·{" "}
        <Link href={`/admin/blog/${id}/edit`}>Back to editor</Link>
      </div>
      <div className="blog-main">
        <header className="blog-article-header">
          <h1>{draft.title || "Untitled article"}</h1>
          <p className="blog-deck">{draft.excerpt}</p>
        </header>
        {cover && <ArticleImage media={cover} preview />}
        <ArticleBody
          markdown={draft.body_markdown}
          media={media}
          preview
          highlights={highlights}
        />
      </div>
    </>
  );
}
