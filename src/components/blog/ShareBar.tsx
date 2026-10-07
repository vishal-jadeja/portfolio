"use client";
import { useState } from "react";
import { useHydrated } from "@/hooks/useHydrated";
export default function ShareBar({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const [message, setMessage] = useState("");
  const hydrated = useHydrated();
  const native = hydrated && typeof navigator.share === "function";
  return (
    <div className="blog-share">
      <span>Share this article</span>
      <div>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url);
              setMessage("Link copied");
            } catch {
              setMessage(`Copy this link: ${url}`);
            }
          }}
        >
          Copy link
        </button>
        {native && (
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.share({ title, url });
              } catch (error) {
                if (!(error instanceof Error && error.name === "AbortError"))
                  setMessage("Unable to share. Try Copy link.");
              }
            }}
          >
            Share
          </button>
        )}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        >
          LinkedIn ↗
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
        >
          X ↗
        </a>
      </div>
      <p role="status">{message}</p>
    </div>
  );
}
