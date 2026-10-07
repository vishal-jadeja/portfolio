import Link from "next/link";

export default function EmptyWriting() {
  return (
    <>
      <section className="blog-empty-writing" aria-labelledby="blog-empty-title">
        <div className="blog-notebook" aria-hidden="true">
          <span className="blog-notebook-title">Notes.</span>
          <span className="blog-notebook-lines" />
        </div>
        <div className="blog-empty-writing-copy">
          <p className="blog-empty-writing-label">A space for new ideas</p>
          <h2 id="blog-empty-title">A little quiet, for now.</h2>
          <p className="blog-empty-writing-description">
            No articles published yet. When I have something worth sharing,
            you’ll find it here.
          </p>
          <Link className="blog-text-link" href="/projects">
            Explore my work
          </Link>
        </div>
      </section>
      <div className="blog-writing-topics">
        <span>A few things on my mind</span>
        <p>Engineering / Systems / Learning</p>
      </div>
    </>
  );
}
