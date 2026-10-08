"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type CategoryLink = { label: string; count: number; href: string; active: boolean };

export default function ExpandableCategoryFilters({ items }: { items: CategoryLink[] }) {
  const [expanded, setExpanded] = useState(false);
  const [layout, setLayout] = useState<{ collapsed: number; full: number; visible: number } | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    const element = list.current;
    if (!element) return;
    let frame = 0;
    let disposed = false;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (disposed) return;
        const links = Array.from(element.children) as HTMLElement[];
        const top = element.getBoundingClientRect().top;
        const rows = [...new Set(links.map(link => Math.round(link.getBoundingClientRect().top - top)))];
        const thirdRow = rows[2] ?? Infinity;
        const visible = links.filter(link => Math.round(link.getBoundingClientRect().top - top) < thirdRow);
        const collapsed = Math.max(0, ...visible.map(link => link.getBoundingClientRect().bottom - top));
        const next = { collapsed: Math.ceil(collapsed), full: element.offsetHeight, visible: visible.length };
        setLayout(previous => previous && previous.collapsed === next.collapsed && previous.full === next.full && previous.visible === next.visible ? previous : next);
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    return () => { disposed = true; observer.disconnect(); cancelAnimationFrame(frame); };
  }, [items]);

  const hiddenCount = layout ? items.length - layout.visible : 0;
  return <nav className="blog-category-filters" aria-label="Blog categories">
    <div id={id} className="blog-category-clip" style={layout ? { height: expanded ? layout.full : layout.collapsed } : undefined}>
      <div ref={list} className="blog-category-list">
        {items.map((item, index) => {
          const hidden = !!layout && !expanded && index >= layout.visible;
          return <Link key={item.href} href={item.href} aria-current={item.active ? "page" : undefined} aria-hidden={hidden || undefined} tabIndex={hidden ? -1 : undefined}>
            {item.label} <span>{item.count}</span>
          </Link>;
        })}
      </div>
    </div>
    {hiddenCount > 0 && <button type="button" className="blog-category-more" aria-expanded={expanded} aria-controls={id} onClick={() => setExpanded(value => !value)}>
      {expanded ? "Show less" : `+${hiddenCount} more`}
    </button>}
  </nav>;
}
