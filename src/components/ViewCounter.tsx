"use client";
import { useEffect, useState } from "react";
// Hero and footer share one visit registration and the same total.
let visitRequest: Promise<number> | undefined;
function loadViews() {
  if (!visitRequest) {
    visitRequest = (async () => {
      // A failed increment should not prevent displaying the existing total.
      await fetch("/api/views", {
        method: "POST",
        body: JSON.stringify({ page: "/" }),
        headers: { "Content-Type": "application/json" },
      }).catch(() => undefined);
      const response = await fetch("/api/views?page=/", { cache: "no-store" });
      if (!response.ok) throw new Error("View count unavailable");
      const data = await response.json();
      if (typeof data.count !== "number" || !Number.isFinite(data.count) || data.count < 0)
        throw new Error("Invalid view count");
      return data.count;
    })().catch((error) => {
      visitRequest = undefined;
      throw error;
    });
  }
  return visitRequest;
}

export default function ViewCounter({ compact = false }: { compact?: boolean }) {
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    loadViews().then((value) => { if (active) setCount(value); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  return (
    <span className={`view-counter font-mono text-text-muted text-xs inline-flex items-center gap-1.5${compact ? " opacity-70" : ""}`} title={failed ? "View count temporarily unavailable" : "Total page views"} aria-live="polite">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="opacity-50"
        aria-hidden="true"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span aria-busy={count === null && !failed}>{count === null ? (failed ? "—" : "…") : count.toLocaleString()} views</span>
    </span>
  );
}
