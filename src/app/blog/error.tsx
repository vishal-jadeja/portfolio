"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="blog-empty">
      <h1>Articles couldn’t load.</h1>
      <p>Please try again in a moment.</p>
      <button className="blog-button" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
