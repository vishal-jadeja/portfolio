import Link from "next/link";
import { categoryCounts } from "@/lib/blog/categories";
import { listingPath } from "@/lib/blog/metadata";
import type { Summary } from "@/lib/blog/types";

export default function CategoryFilters({ posts, active }: { posts: Summary[]; active: string }) {
  const categories = categoryCounts(posts);
  return (
    <nav className="blog-category-filters" aria-label="Blog categories">
      <Link href="/blog" aria-current={!active ? "page" : undefined}>
        All <span>{posts.length}</span>
      </Link>
      {categories.map(({ tag, label, count }) => (
        <Link key={tag} href={listingPath(1, tag)} aria-current={active === tag ? "page" : undefined}>
          {label} <span>{count}</span>
        </Link>
      ))}
    </nav>
  );
}
