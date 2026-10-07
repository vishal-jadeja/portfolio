import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
export default function BlogHeader() {
  return (
    <header className="blog-header">
      <div className="blog-header-inner">
        <Link className="blog-brand" href="/">
          VJ<span> / writing</span>
        </Link>
        <nav aria-label="Blog navigation">
          <Link href="/">Home</Link>
          <Link href="/blog">Blog</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
