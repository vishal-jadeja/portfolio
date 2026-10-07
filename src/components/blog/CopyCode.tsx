"use client";
import { useState } from "react";
export default function CopyCode({ code }: { code: string }) {
  const [label, setLabel] = useState("Copy");
  return (
    <button
      type="button"
      className="blog-copy-code"
      aria-label="Copy code"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setLabel("Copied");
        } catch {
          setLabel("Copy failed");
        }
        setTimeout(() => setLabel("Copy"), 2500);
      }}
    >
      {label}
    </button>
  );
}
