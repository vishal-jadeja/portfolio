"use client";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useHydrated } from "@/hooks/useHydrated";

type Heading = { id: string; title: string; depth: number };
export default function ReadingProgress({ headings }: { headings: Heading[] }) {
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const subscribe = useCallback((notify: () => void) => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(notify);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  const snapshot = useCallback(() => {
    const article = document.querySelector(".blog-reading-article");
    const top = article
      ? article.getBoundingClientRect().top + window.scrollY
      : 0;
    const bottom = article
      ? top + article.getBoundingClientRect().height
      : document.documentElement.scrollHeight;
    const range = Math.max(1, bottom - top - window.innerHeight);
    const progress = Math.min(
      100,
      Math.max(0, Math.round(((window.scrollY - top) / range) * 100)),
    );
    let active = headings[0]?.id ?? "";
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element && element.getBoundingClientRect().top <= 150)
        active = heading.id;
    }
    return `${progress}:${active}`;
  }, [headings]);
  const value = useSyncExternalStore(subscribe, snapshot, () => "0:");
  const [percent, activeId] = value.split(":");
  const active =
    headings.find((heading) => heading.id === activeId) ?? headings[0];
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const outside = (event: PointerEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node))
        setOpen(false);
    };
    window.addEventListener("keydown", close);
    window.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("keydown", close);
      window.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  if (!hydrated || !headings.length) return null;
  return (
    <div className="blog-reading-dock">
      <div className="blog-reading-control" ref={panel}>
        {open && (
          <nav
            id="reading-section-menu"
            className="blog-reading-menu"
            aria-label="Article sections"
          >
            {headings.map((heading) => (
              <a
                href={`#${heading.id}`}
                key={heading.id}
                aria-current={heading.id === activeId ? "location" : undefined}
                onClick={() => setOpen(false)}
              >
                {heading.title}
              </a>
            ))}
          </nav>
        )}
        <button
          className="blog-reading-pill"
          type="button"
          aria-label="Open article sections"
          aria-controls="reading-section-menu"
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
        >
          <span className="blog-reading-dot" aria-hidden="true" />
          <span className="blog-reading-label">
            {active?.title ?? "In this article"}
          </span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            aria-label={`${percent}% read`}
            role="img"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeOpacity=".2"
              strokeWidth="2"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="56.55"
              strokeDashoffset={56.55 * (1 - Number(percent) / 100)}
              transform="rotate(-90 12 12)"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
