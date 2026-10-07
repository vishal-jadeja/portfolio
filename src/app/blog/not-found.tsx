import Link from "next/link";
export default function NotFound() {
  return (
    <div className="blog-empty">
      <h1>Page not found.</h1>
      <p>
        This article or page is unavailable. Explore the published articles
        below.
      </p>
      <Link href="/blog" className="blog-text-link">
        ← All writing
      </Link>
    </div>
  );
}
