import { categoryCounts } from "@/lib/blog/categories";
import { listingPath } from "@/lib/blog/metadata";
import type { Summary } from "@/lib/blog/types";
import ExpandableCategoryFilters from "./ExpandableCategoryFilters";

export default function CategoryFilters({ posts, active }: { posts: Summary[]; active: string }) {
  const categories = categoryCounts(posts);
  // Keep the selected category visible even when it would otherwise fall after row two.
  const ordered = [...categories].sort((a, b) => Number(b.tag === active) - Number(a.tag === active));
  return <ExpandableCategoryFilters items={[
    { label: "All", count: posts.length, href: "/blog", active: !active },
    ...ordered.map(({ tag, label, count }) => ({ label, count, href: listingPath(1, tag), active: active === tag })),
  ]} />;
}
