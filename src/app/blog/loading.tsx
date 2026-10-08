export default function BlogLoading() {
  return (
    <div className="blog-loading" role="status" aria-label="Loading articles" aria-busy="true">
      <span className="sr-only">Loading articles</span>
      <div aria-hidden="true">
        <div className="blog-loading-bar blog-loading-heading" />
        <div className="blog-loading-bar blog-loading-intro" />
        <div className="blog-loading-filters">
          {[0, 1, 2, 3].map((item) => <span key={item} className="blog-loading-bar" />)}
        </div>
        {[0, 1, 2].map((item) => (
          <div key={item} className="blog-loading-row">
            <div className="blog-loading-bar blog-loading-title" />
            <div className="blog-loading-bar blog-loading-description" />
            <div className="blog-loading-bar blog-loading-meta" />
          </div>
        ))}
      </div>
    </div>
  );
}
