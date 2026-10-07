import Link from "next/link";
import PostList from "@/components/blog/PostList";
import { listPublishedPosts } from "@/lib/blog/queries";
import "@/components/blog/blog.css";
export default async function Blog() {
  const { posts } = await listPublishedPosts(1, "", 3);
  return <section id="blog" className="blog-home"><div className="blog-home-heading"><h2>Writing</h2><Link href="/blog" className="blog-text-link">All articles →</Link></div>{posts.length ? <PostList posts={posts} /> : <p className="blog-editor-note">Thoughts on engineering and systems. New articles coming soon.</p>}</section>;
}
