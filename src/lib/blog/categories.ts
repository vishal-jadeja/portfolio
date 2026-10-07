import type { Summary } from "./types";

export function categoryLabel(tag: string) {
  const names: Record<string, string> = { ai: "AI", ml: "ML", api: "API", nextjs: "Next.js", "next.js": "Next.js" };
  return names[tag.toLowerCase()] ?? tag.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function categoryCounts(posts: Pick<Summary, "tags">[]) {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of new Set(post.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts].map(([tag, count]) => ({ tag, label: categoryLabel(tag), count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
