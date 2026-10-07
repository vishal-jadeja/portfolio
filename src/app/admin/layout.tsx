import BlogSurface from "@/components/blog/BlogSurface";
import type { Metadata } from "next";
import { pageRobots } from "@/lib/seo";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import "@/components/blog/blog.css";
export const metadata: Metadata = {
  title: "Blog studio",
  robots: pageRobots(false, false),
};
export const dynamic = "force-dynamic";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <BlogSurface className="blog-admin">
      <header className="blog-admin-top">
        <Link href="/admin/blog">VJ / blog studio</Link>
        <div>
          <Link href="/blog">View blog ↗</Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="main-content">{children}</main>
    </BlogSurface>
  );
}
