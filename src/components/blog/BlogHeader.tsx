import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SiteSearch from "@/components/search/SiteSearch";
import SearchButton from "@/components/search/SearchButton";
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
          {/* Swap at the blog's phone breakpoint (blog.css `max-width: 700px`); Tailwind's max-[701px] is `width < 701px`. */}
          <SearchButton variant="pill" className="max-[701px]:hidden" />
          <SearchButton variant="icon" className="blog-search-button hidden max-[701px]:flex" />
          <ThemeToggle />
        </nav>
      </div>
      <SiteSearch />
    </header>
  );
}
