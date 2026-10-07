"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { isInProgress, statusLabel, techFamily } from "@/lib/projects";
import { projectAnchorId } from "@/lib/search/static-entries";

/** Highlights shown before "Show more"; enough to sell the project at a glance. */
const PREVIEW_HIGHLIGHTS = 3;

const GITHUB_PATH =
  "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22";

function StatusPill({ project }: { project: Project }) {
  const live = isInProgress(project);
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.12em] text-text-muted">
      <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
        {live && (
          <span className="absolute inset-0 rounded-full bg-amber-500 dark:bg-[#FFE600] opacity-60 animate-ping motion-reduce:hidden" />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${live ? "bg-amber-500 dark:bg-[#FFE600]" : "bg-text-main"}`} />
      </span>
      {statusLabel(project)}
    </span>
  );
}

function Preview({ project }: { project: Project }) {
  return (
    <div className="relative aspect-[16/10] sm:aspect-[2/1] overflow-hidden rounded-xl border border-[var(--glass-border)] bg-[var(--theme-card)]">
      {project.imageUrl ? (
        <Image
          src={project.imageUrl}
          alt={`${project.title} screenshot`}
          fill
          className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.02]"
          sizes="(max-width: 840px) 100vw, 776px"
          unoptimized
        />
      ) : (
        <>
          <div className="absolute inset-0 hatch-bg" aria-hidden="true" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-4xl sm:text-5xl font-bold tracking-tight text-text-main/80">
              {project.title}
            </span>
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-text-muted">
              Preview coming soon
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function Highlights({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const extra = items.length - PREVIEW_HIGHLIGHTS;
  const row = (text: string) => (
    <>
      <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-text-muted" />
      <span>{text}</span>
    </>
  );

  return (
    <div className="mt-7">
      <h3 className="section-label mb-3">Key highlights</h3>
      <ul id={listId} className="grid gap-2.5 text-sm leading-relaxed text-text-main/85">
        {items.slice(0, PREVIEW_HIGHLIGHTS).map((h) => (
          <li key={h} className="flex gap-3">{row(h)}</li>
        ))}
        <AnimatePresence initial={false}>
          {open &&
            items.slice(PREVIEW_HIGHLIGHTS).map((h, i) => (
              <motion.li
                key={h}
                className="flex gap-3"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                {row(h)}
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
      {extra > 0 && (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-text-main transition-colors"
        >
          {open ? "Show less" : `Show ${extra} more`}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function ProjectCaseStudy({
  project,
  number,
  activeTech,
}: {
  project: Project;
  number: number;
  activeTech: string | null;
}) {
  const id = projectAnchorId(project.title);

  return (
    <motion.article
      id={id}
      data-search-anchor
      aria-labelledby={`${id}-title`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group px-5 sm:px-8 py-10 sm:py-12"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-xs font-semibold tracking-[0.12em] text-text-muted">
          {String(number).padStart(2, "0")}
        </span>
        <span aria-hidden="true" className="h-px flex-1 bg-[var(--glass-border)]" />
        <StatusPill project={project} />
      </div>

      <Preview project={project} />

      <div className="mt-7">
        <h2 id={`${id}-title`} className="text-3xl font-bold tracking-tight text-text-main">
          {project.title}
        </h2>
        <p className="mt-1.5 font-medium text-text-main/70">{project.tagline}</p>
        <p className="mt-4 max-w-[68ch] text-sm leading-relaxed text-text-muted">
          {project.description}
        </p>
      </div>

      <Highlights items={project.highlights} />

      <div className="mt-7">
        <h3 className="section-label mb-3">Built with</h3>
        <ul className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <li key={tech} className={`chip${activeTech === techFamily(tech) ? " chip--match" : ""}`}>
              {tech}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a href={project.github} target="_blank" rel="noopener noreferrer" className="modern-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={GITHUB_PATH} />
          </svg>
          View on GitHub
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" className="modern-btn-outline">
            Live demo
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17L17 7M8 7h9v9" />
            </svg>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        )}
      </div>
    </motion.article>
  );
}
