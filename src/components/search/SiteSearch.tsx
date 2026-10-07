"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { hashId } from "@/lib/search/hash";

const SearchDialog = dynamic(() => import("./SearchDialog"), { ssr: false });

export const OPEN_SEARCH_EVENT = "openSearch";
/** Fired with an anchor id before a same-page jump, so filtered lists can unhide the target. */
export const REVEAL_ANCHOR_EVENT = "revealAnchor";

export function openSearch() {
  window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT));
}

/** Briefly highlights a deep-linked card such as /projects#project-deplyx. */
export function flashAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el?.hasAttribute("data-search-anchor")) return;
  el.classList.remove("search-flash");
  void el.offsetWidth; // restart the animation if it is already running
  el.classList.add("search-flash");
  window.setTimeout(() => el.classList.remove("search-flash"), 1800);
}

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
  );
}

/**
 * Mount once per layout. Owns the ⌘K / Ctrl+K and "/" shortcuts; the dialog
 * code is only downloaded the first time search opens.
 */
export default function SiteSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_SEARCH_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    // Arriving from a search on another page: Next scrolls to the hash, we add the highlight.
    if (window.location.hash) flashAnchor(hashId(window.location.hash));
    return () => {
      window.removeEventListener(OPEN_SEARCH_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return open ? <SearchDialog onClose={() => setOpen(false)} /> : null;
}
