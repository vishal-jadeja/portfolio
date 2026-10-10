import { listPublishedPosts } from "@/lib/blog/queries";
import { BLOG_DESCRIPTION } from "@/lib/blog/metadata";
import type { Summary } from "@/lib/blog/types";
import { C, Canvas, OG_SIZE, OG_TYPE, PageHeader, PageTitle, avatarSrc, renderCard } from "@/lib/og/kit";

export const alt = "Writing by Vishal Jadeja";
export const size = OG_SIZE;
export const contentType = OG_TYPE;
// Next.js requires a literal here; match BLOG_REVALIDATE_SECONDS. Publishing
// also expires it through the "blog:posts" tag on the query below.
export const revalidate = 86400;

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function BlogImage() {
  let latest: Summary[] = [];
  try {
    latest = (await listPublishedPosts(1, "", 3)).posts;
  } catch {
    // The card still works as a plain title card without the post list.
  }
  const avatar = await avatarSrc();
  return renderCard(
    <Canvas padding={64}>
      <PageHeader avatar={avatar} section="blog" />
      <div style={{ display: "flex", marginTop: 36 }}>
        <PageTitle title="Blog" description={BLOG_DESCRIPTION} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
        {latest.map((post) => (
          <div
            key={post.post_id}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 32, padding: "13px 0", borderTop: `1px solid ${C.border}` }}
          >
            <div style={{ display: "block", fontSize: 24, fontWeight: 500, color: C.text, maxWidth: 820, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {post.title}
            </div>
            <div style={{ display: "flex", flexShrink: 0, fontSize: 19, color: C.faint, fontFamily: "JetBrains Mono" }}>
              {date.format(new Date(post.published_at))}
            </div>
          </div>
        ))}
      </div>
    </Canvas>,
  );
}
