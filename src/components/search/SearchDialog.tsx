"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { highlightRanges, matchSnippet, prepare, search } from "@/lib/search/match";
import { staticSearchEntries } from "@/lib/search/static-entries";
import { KIND_LABELS, type SearchEntry, type SearchKind } from "@/lib/search/types";
import { SearchIcon } from "./SearchButton";
import { hashId } from "@/lib/search/hash";
import { REVEAL_ANCHOR_EVENT, flashAnchor } from "./SiteSearch";

const STATIC_ENTRIES = staticSearchEntries();
const GROUP_LIMIT = 6;
const STALE_MS = 5 * 60_000;

// Shared across opens and client navigations. Shown instantly on reopen, and
// refreshed once stale so a long-lived tab still picks up newly published posts.
let cached: { entries: SearchEntry[]; at: number } | null = null;
let inflight: Promise<SearchEntry[]> | null = null;
function loadBlogEntries() {
  inflight ??= fetch("/api/search")
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
    .then((data: { entries?: unknown }) => {
      const entries = Array.isArray(data.entries) ? (data.entries as SearchEntry[]) : [];
      cached = { entries, at: Date.now() };
      return entries;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

type Group = { label: string; items: SearchEntry[] };

function groupResults(results: SearchEntry[]): Group[] {
  // Groups appear in the order of their best hit; items keep rank order.
  const groups = new Map<SearchKind, SearchEntry[]>();
  for (const entry of results) {
    const items = groups.get(entry.kind) ?? [];
    if (items.length < GROUP_LIMIT) items.push(entry);
    groups.set(entry.kind, items);
  }
  return [...groups].map(([kind, items]) => ({ label: KIND_LABELS[kind], items }));
}

/**
 * The subtitle, unless the match is only in hidden fields: then show where it
 * matched (tech stack or description) so the result explains itself.
 */
function detail(entry: SearchEntry, query: string) {
  if (!query.trim() || (entry.subtitle && highlightRanges(entry.subtitle, query).length) || highlightRanges(entry.title, query).length)
    return entry.subtitle;
  return (
    matchSnippet(entry.keywords?.join(", ") ?? "", query) ??
    matchSnippet(entry.body ?? "", query) ??
    entry.subtitle
  );
}

/** Wraps the parts of `text` that match the query in <mark>. */
function Highlight({ text, query }: { text: string; query: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const [start, end] of highlightRanges(text, query)) {
    parts.push(text.slice(last, start), <mark key={start} className="search-mark">{text.slice(start, end)}</mark>);
    last = end;
  }
  parts.push(text.slice(last));
  return <>{parts}</>;
}

function KindIcon({ kind }: { kind: SearchKind }) {
  const paths: Record<SearchKind, React.ReactNode> = {
    page: <path d="M4 6h16M4 12h16M4 18h10" />,
    article: <><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6M8 13h8M8 17h5" /></>,
    project: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>,
    experience: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    skill: <path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12" />,
    topic: <path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16" />,
    link: <path d="M7 17 17 7M8 7h9v9" />,
  };
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

export default function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  // Track the highlighted entry by id, not index, so it stays put when articles
  // arrive and are inserted above it. null means "first result".
  const [activeId, setActiveId] = useState<string | null>(null);
  const [blog, setBlog] = useState<{ status: "loading" | "ready" | "error"; entries: SearchEntry[] }>(() =>
    cached ? { status: "ready", entries: cached.entries } : { status: "loading", entries: [] },
  );

  useEffect(() => {
    if (cached && Date.now() - cached.at < STALE_MS) return;
    let live = true;
    loadBlogEntries().then(
      (entries) => live && setBlog({ status: "ready", entries }),
      // A failed refresh keeps the stale list; only an empty cache is an error.
      () => live && setBlog((b) => (b.status === "ready" ? b : { status: "error", entries: [] })),
    );
    return () => {
      live = false;
    };
  }, []);

  // Lock page scroll and hand focus back to whatever opened the dialog.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      root.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  const prepared = useMemo(() => prepare([...STATIC_ENTRIES, ...blog.entries]), [blog.entries]);

  const groups = useMemo<Group[]>(() => {
    if (query.trim()) return groupResults(search(prepared, query));
    const latest = blog.entries.filter((e) => e.kind === "article").slice(0, 3);
    return [
      ...(latest.length ? [{ label: "Latest articles", items: latest }] : []),
      { label: "Jump to", items: STATIC_ENTRIES.filter((e) => e.kind === "page") },
    ];
  }, [prepared, query, blog.entries]);

  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const activeIndex = Math.max(0, flat.findIndex((e) => e.id === activeId));
  const current = flat[activeIndex] as SearchEntry | undefined;
  const optionId = (entry: SearchEntry) => `${listId}-${entry.id}`;

  useEffect(() => {
    if (current) document.getElementById(optionId(current))?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function go(entry: SearchEntry) {
    onClose();
    if (entry.external) {
      if (entry.href.startsWith("mailto:")) window.location.href = entry.href;
      else window.open(entry.href, "_blank", "noopener,noreferrer");
      return;
    }
    const url = new URL(entry.href, window.location.origin);
    const id = hashId(url.hash);
    if (id && url.pathname === window.location.pathname) {
      // Same page: scroll ourselves so repeat searches for the same hash still move.
      // Deferred until the dialog has unmounted and released its scroll lock.
      window.history.pushState(null, "", url.hash);
      window.dispatchEvent(new CustomEvent(REVEAL_ANCHOR_EVENT, { detail: id }));
      window.setTimeout(() => {
        const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
        // "#top" means the top of the document, as in the HTML spec and Next's router.
        if (id === "top") window.scrollTo({ top: 0, behavior });
        else document.getElementById(id)?.scrollIntoView({ behavior, block: "start" });
        flashAnchor(id);
      }, 0);
    } else {
      // Other page: Next scrolls to the hash; that page's SiteSearch adds the highlight.
      router.push(entry.href);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    // Keys that confirm an IME composition (CJK input) must not act on results.
    // Safari reports keyCode 229 instead of isComposing for the confirming Enter.
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    const move = (to: number) => {
      e.preventDefault();
      if (flat.length) setActiveId(flat[(to + flat.length) % flat.length].id);
    };
    if (e.key === "ArrowDown") move(activeIndex + 1);
    else if (e.key === "ArrowUp") move(activeIndex - 1);
    else if (e.key === "Home" && e.ctrlKey) move(0);
    else if (e.key === "End" && e.ctrlKey) move(flat.length - 1);
    else if (e.key === "Enter" && current) {
      e.preventDefault();
      go(current);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "Tab") {
      // The input is the only tab stop; results are reached with the arrow keys.
      e.preventDefault();
    }
  }

  const hasQuery = Boolean(query.trim());
  const status =
    hasQuery && !flat.length
      ? blog.status === "loading"
        ? "Searching articles…"
        : `No results for “${query.trim()}”`
      : hasQuery
        ? `${flat.length} result${flat.length === 1 ? "" : "s"}`
        : "";

  return createPortal(
    <div
      className="search-overlay fixed inset-0 z-[1000] flex items-start justify-center px-4 pt-[12vh]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
        className="search-panel w-full max-w-[580px] overflow-hidden rounded-2xl border border-border-main bg-bg text-text-main shadow-[0_24px_64px_rgba(0,0,0,0.25)] font-sans"
        onKeyDown={onKeyDown}
        // Keep focus in the input when clicking labels, padding or the footer;
        // otherwise focus drops to <body> and Esc/arrow keys stop reaching us.
        // Clicks still fire, so options and the ESC button keep working.
        onMouseDown={(e) => e.target !== inputRef.current && e.preventDefault()}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-border-main">
          <span className="text-text-muted"><SearchIcon size={17} /></span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveId(null);
            }}
            placeholder="Search projects, articles, skills…"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={current ? optionId(current) : undefined}
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="go"
            className="flex-1 min-w-0 bg-transparent text-[15px] outline-none placeholder:text-text-muted"
          />
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] text-text-muted px-1.5 py-1 rounded-md border border-border-main hover:text-text-main"
          >
            ESC
          </button>
        </div>

        <div id={listId} role="listbox" aria-label="Search results" className="max-h-[min(60vh,460px)] overflow-y-auto overscroll-contain p-2">
          {groups.map((group) => (
            <div key={group.label} role="group" aria-label={group.label} className="mb-1 last:mb-0">
              <div className="px-2.5 pt-2 pb-1.5 font-mono text-[10.5px] uppercase tracking-wider text-text-muted" aria-hidden="true">
                {group.label}
              </div>
              {group.items.map((entry) => {
                const selected = entry === current;
                const subtitle = detail(entry, query);
                return (
                  <div
                    key={entry.id}
                    id={optionId(entry)}
                    role="option"
                    aria-selected={selected}
                    onMouseMove={() => !selected && setActiveId(entry.id)}
                    onClick={() => go(entry)}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg cursor-pointer ${selected ? "bg-[var(--theme-card)]" : ""}`}
                  >
                    <span className={`shrink-0 flex items-center justify-center w-8 h-8 rounded-md border border-border-main ${selected ? "text-text-main" : "text-text-muted"}`}>
                      <KindIcon kind={entry.kind} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block truncate text-sm font-medium">
                        <Highlight text={entry.title} query={query} />
                      </span>
                      {subtitle && (
                        <span className="block truncate text-xs text-text-muted">
                          <Highlight text={subtitle} query={query} />
                        </span>
                      )}
                    </span>
                    {entry.meta && <span className="shrink-0 font-mono text-[10.5px] text-text-muted">{entry.meta}</span>}
                    {entry.external && (
                      <span className="shrink-0 text-text-muted">
                        <span className="sr-only">(opens externally)</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          {hasQuery && !flat.length && (
            <p className="px-3 py-8 text-center text-sm text-text-muted">{status}</p>
          )}
          {blog.status === "error" && (
            <p className="px-3 pt-1 pb-2 text-xs text-text-muted">Articles couldn’t be loaded — showing portfolio results only.</p>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-4 px-4 h-10 border-t border-border-main font-mono text-[10.5px] text-text-muted">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{status}</p>
      </div>
    </div>,
    document.body,
  );
}
