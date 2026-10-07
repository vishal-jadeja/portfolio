import Link from "next/link";
import { requireOwner } from "@/lib/blog/auth";
import { createDraftAction, signOutAction } from "@/lib/blog/actions";
import type { Draft } from "@/lib/blog/types";
import { formatDate } from "@/components/blog/PostList";
import { blogConfigured } from "@/lib/config/blog-env";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ archived?: string }>;
}) {
  if (!blogConfigured())
    return (
      <>
        <h1>Set up your blog studio.</h1>
        <p className="blog-admin-intro">
          Follow docs/blog-setup.md to connect Supabase and provision your owner
          account.
        </p>
      </>
    );
  const { client } = await requireOwner(true);
  const { archived } = await searchParams;
  let query = client
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  query =
    archived === "1"
      ? query.not("archived_at", "is", null)
      : query.is("archived_at", null);
  const [{ data: drafts, error }, { data: published, error: publicError }] =
    await Promise.all([
      query,
      client.from("blog_publications").select("post_id,source_version"),
    ]);
  if (error || publicError) throw new Error("Could not load the studio.");
  return (
    <>
      <h1>Your writing.</h1>
      <p className="blog-admin-intro">
        Draft quietly. Publish when it’s ready.
      </p>
      <div className="blog-admin-actions">
        <form action={createDraftAction}>
          <button className="blog-button">New article +</button>
        </form>
        <Link
          className="blog-button secondary"
          href={archived === "1" ? "/admin/blog" : "/admin/blog?archived=1"}
        >
          {archived === "1" ? "Active articles" : "Archived"}
        </Link>
        <form action={signOutAction}>
          <button className="blog-button secondary">Sign out</button>
        </form>
      </div>
      <div className="blog-admin-list">
        {(drafts as Draft[]).map((d) => {
          const publication = published?.find((p) => p.post_id === d.id);
          const status = d.archived_at
            ? "Archived"
            : publication
              ? publication.source_version === d.version
                ? "Published"
                : "Unpublished changes"
              : "Draft";
          return (
            <article className="blog-admin-row" key={d.id}>
              <div>
                <h2>
                  <Link href={`/admin/blog/${d.id}/edit`}>
                    {d.title || "Untitled article"}
                  </Link>
                </h2>
                <small>
                  Edited {formatDate(d.updated_at)} · /{d.slug}
                </small>
              </div>
              <span className="blog-status">{status}</span>
            </article>
          );
        })}
        {!drafts?.length && (
          <p className="blog-empty">
            {archived === "1"
              ? "No archived articles."
              : "Your next idea starts here. Create an article to begin."}
          </p>
        )}
      </div>
    </>
  );
}
