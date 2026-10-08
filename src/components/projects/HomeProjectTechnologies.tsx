"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function HomeProjectTechnologies({ technologies, href, projectTitle }: {
  technologies: string[];
  href: string;
  projectTitle: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const measurementRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(Math.min(3, technologies.length));

  useEffect(() => {
    const container = containerRef.current;
    const measurement = measurementRef.current;
    if (!container || !measurement) return;
    let active = true;

    function measure() {
      if (!active || !container || !measurement) return;
      const width = container.clientWidth;
      if (!width) return;
      const gap = parseFloat(getComputedStyle(container).columnGap) || 6;
      const widths = Array.from(measurement.children, (chip) => chip.getBoundingClientRect().width);
      const moreWidth = widths.pop() ?? 0;
      for (let count = technologies.length; count >= 0; count--) {
        const items = widths.slice(0, count);
        if (count < technologies.length) items.push(moreWidth);
        let rows = 1;
        let used = 0;
        for (const itemWidth of items) {
          if (used && used + gap + itemWidth > width) {
            rows++;
            used = 0;
          }
          used += (used ? gap : 0) + itemWidth;
        }
        if (rows <= 2) {
          setVisibleCount(count);
          break;
        }
      }
    }

    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(measurement);
    measure();
    void document.fonts.ready.then(measure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [technologies]);

  const remaining = technologies.length - visibleCount;
  return (
    <div className="relative min-w-0">
      <div ref={containerRef} className="flex min-w-0 flex-wrap items-center gap-1.5">
        {technologies.slice(0, visibleCount).map((tech) => <span key={tech} className="chip max-w-full" title={tech}><span className="truncate">{tech}</span></span>)}
        {remaining > 0 && (
          <Link href={href} className="chip shrink-0" title={technologies.slice(visibleCount).join(", ")} aria-label={`View ${remaining} more technologies used in ${projectTitle}`}>
            +{remaining} more
          </Link>
        )}
      </div>
      <div aria-hidden="true" className="invisible pointer-events-none absolute inset-x-0 top-0 overflow-hidden">
        <div ref={measurementRef} className="flex w-max gap-1.5">
          {technologies.map((tech) => <span key={tech} className="chip">{tech}</span>)}
          <span className="chip">+{technologies.length} more</span>
        </div>
      </div>
    </div>
  );
}
