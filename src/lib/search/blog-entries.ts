import { listingPath } from "@/lib/blog/metadata";
import type { Summary } from "@/lib/blog/types";
import type { SearchEntry } from "./types";

type PostLike = Pick<Summary, "slug" | "title" | "excerpt" | "tags" | "published_at">;

const date = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });

/** Published articles (newest first) plus one entry per tag. Never body text. */
export function blogSearchEntries(posts: PostLike[]): SearchEntry[] {
  const sorted = [...posts].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const tagCounts = new Map<string, number>();
  for (const p of sorted) for (const t of p.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
  return [
    ...sorted.map((p) => ({
      id: `article:${p.slug}`,
      kind: "article" as const,
      title: p.title,
      subtitle: p.excerpt,
      meta: date.format(new Date(p.published_at)),
      keywords: p.tags,
      href: `/blog/${p.slug}`,
    })),
    ...[...tagCounts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({
        id: `topic:${tag}`,
        kind: "topic" as const,
        title: tag,
        subtitle: `${count} article${count === 1 ? "" : "s"}`,
        href: listingPath(1, tag),
      })),
  ];
}
