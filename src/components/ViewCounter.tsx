"use client";
import { useEffect, useState } from "react";
export default function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      body: JSON.stringify({ page: "/" }),
      headers: { "Content-Type": "application/json" },
    })
      .then(() => fetch("/api/views?page=/"))
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
  }, []);

  if (count === null) return null;

  return (
    <span className="font-mono text-text-muted text-xs flex items-center gap-1.5">
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
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {count?.toLocaleString()} views
    </span>
  );
}
