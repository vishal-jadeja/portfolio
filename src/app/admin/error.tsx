"use client";
import Link from "next/link";
export default function AdminError({ reset }: { reset: () => void }) {
  return (
    <>
      <h1>The studio couldn’t load.</h1>
      <p className="blog-admin-intro">
        Check your sign-in and blog setup, then try again.
      </p>
      <div className="blog-admin-actions">
        <button className="blog-button" onClick={reset}>
          Retry
        </button>
        <Link href="/admin/login" className="blog-button secondary">
          Sign in
        </Link>
      </div>
    </>
  );
}
