"use client";

import { useSyncExternalStore } from "react";
import { openSearch } from "./SiteSearch";

const noop = () => () => {};
const isApple = () => /Mac|iPhone|iPad/.test(navigator.platform);

export function SearchIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

// Warm the dialog chunk on intent so the first open feels instant.
const preload = () => void import("./SearchDialog");

const keyCap =
  "inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-md font-mono text-[11px] leading-none bg-[var(--theme-card)] border border-[var(--theme-border-main)]";

export default function SearchButton({ variant, className = "" }: { variant: "pill" | "icon"; className?: string }) {
  const apple = useSyncExternalStore(noop, isApple, () => true);
  const modifier = apple ? "⌘" : "Ctrl";
  const shortcut = `${modifier}${apple ? "" : " "}K`;

  if (variant === "icon")
    return (
      <button
        type="button"
        onClick={openSearch}
        onPointerEnter={preload}
        onFocus={preload}
        aria-label="Search the site"
        aria-keyshortcuts="Meta+K Control+K /"
        title={`Search (${shortcut})`}
        className={className}
      >
        <SearchIcon />
      </button>
    );

  return (
    <button
      type="button"
      onClick={openSearch}
      onPointerEnter={preload}
      onFocus={preload}
      aria-label="Search the site"
      aria-keyshortcuts="Meta+K Control+K /"
      title={`Search (${shortcut})`}
      className={`search-trigger flex items-center gap-1 h-8 pl-2.5 pr-1.5 rounded-full border border-[var(--glass-border)] text-text-muted hover:text-text-main transition-colors ${className}`}
    >
      <span className="mr-1"><SearchIcon size={14} /></span>
      <kbd className={keyCap} aria-hidden="true">{modifier}</kbd>
      <kbd className={keyCap} aria-hidden="true">K</kbd>
    </button>
  );
}
