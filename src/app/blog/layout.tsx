import BlogSurface from "@/components/blog/BlogSurface";
import BlogHeader from "@/components/blog/BlogHeader";
import Link from "next/link";
import "@/components/blog/blog.css";
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BlogSurface className="blog-shell">
      <BlogHeader />
      {process.env.BLOG_DEMO === "1" && (
        <div className="blog-preview-banner">
          Sample preview · Local demo content
        </div>
      )}
      <main id="main-content" className="blog-main">
        {children}
      </main>
      <footer className="blog-footer">
        <span>© {new Date().getFullYear()} Vishal Jadeja</span>
        <div>
          <Link href="/">Portfolio</Link>
          <a href="/feed.xml">RSS</a>
        </div>
      </footer>
    </BlogSurface>
  );
}
