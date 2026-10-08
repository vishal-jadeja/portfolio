import AllArticlesLink from "@/components/blog/AllArticlesLink";
import PostList from "@/components/blog/PostList";
import { listPublishedPosts } from "@/lib/blog/queries";
import "@/components/blog/blog.css";
export default async function Blog() {
  const { posts } = await listPublishedPosts(1, "", 3);
  return (
    <section id="blog" className="blog-home">
      <div className="section-heading">
        <div className="blog-home-heading">
          <h2 className="section-title">Blog</h2>
          <AllArticlesLink />
        </div>
        <p className="section-description">On engineering, systems, and the things I learn along the way.</p>
      </div>
      {posts.length ? <PostList posts={posts} /> : <p className="blog-editor-note">New articles coming soon.</p>}
    </section>
  );
}
