"use client";

import type { PointerEvent, ReactNode } from "react";
import { hoverPreviewOffset } from "@/lib/blog/hover-preview";

export default function PostHoverCard({ children }: { children: ReactNode }) {
  function trackPointer(event: PointerEvent<HTMLElement>) {
    if (
      event.pointerType === "touch" ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    const card = event.currentTarget;
    const preview = card.querySelector<HTMLElement>(".blog-post-cover");
    if (!preview) return;
    const bounds = card.getBoundingClientRect();
    const offset = hoverPreviewOffset(
      { x: event.clientX, y: event.clientY },
      bounds,
      { width: preview.offsetWidth, height: preview.offsetHeight },
      { width: window.innerWidth, height: window.innerHeight },
    );
    card.style.setProperty("--blog-preview-x", `${offset.x}px`);
    card.style.setProperty("--blog-preview-y", `${offset.y}px`);
  }

  function resetPointer(event: PointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--blog-preview-x");
    event.currentTarget.style.removeProperty("--blog-preview-y");
  }

  return (
    <article
      className="blog-post-row"
      onPointerEnter={trackPointer}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      onPointerCancel={resetPointer}
    >
      {children}
    </article>
  );
}
