"use client";

import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { filterProjects, sharedTech, type StatusFilter } from "@/lib/projects";
import { projectAnchorId } from "@/lib/search/static-entries";
import { REVEAL_ANCHOR_EVENT } from "@/components/search/SiteSearch";
import ProjectCard from "./ProjectCard";

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shipped", label: "Shipped" },
  { value: "in-progress", label: "In progress" },
];

const STACK = sharedTech(projects);

export default function ProjectsIndex() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tech, setTech] = useState<string | null>(null);
  const shown = filterProjects(projects, status, tech);
  const filtered = status !== "all" || tech !== null;
  const clear = () => {
    setStatus("all");
    setTech(null);
  };

  // A ⌘K search for a project hidden by the current filters clears them before the jump.
  useEffect(() => {
    const onReveal = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (document.getElementById(id) || !projects.some((p) => projectAnchorId(p.title) === id)) return;
      flushSync(() => {
        setStatus("all");
        setTech(null);
      });
    };
    window.addEventListener(REVEAL_ANCHOR_EVENT, onReveal);
    return () => window.removeEventListener(REVEAL_ANCHOR_EVENT, onReveal);
  }, []);

  return (
    <>
      <div className="site-gutter pb-4 flex flex-col gap-3 anim-fade-up [animation-delay:120ms]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Counts are faceted: each option shows what you'd get combined with the other filter. */}
          <div role="group" aria-label="Filter by status" className="self-start inline-flex flex-wrap p-1 rounded-full border border-[var(--glass-border)] bg-[var(--theme-card)]">
            {STATUSES.map((s) => {
              const active = status === s.value;
              const count = filterProjects(projects, s.value, tech).length;
              return (
                <button
                  key={s.value}
                  type="button"
                  aria-pressed={active}
                  disabled={count === 0 && !active}
                  onClick={() => setStatus(s.value)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 disabled:opacity-35 disabled:cursor-not-allowed ${active ? "text-bg" : "text-text-muted enabled:hover:text-text-main"}`}
                >
                  {active && (
                    <motion.span
                      layoutId="project-status-pill"
                      className="absolute inset-0 rounded-full bg-text-main"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative">
                    {s.label}{" "}
                    <span className="font-mono opacity-60">{count}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="project-stack-filter">
            <label htmlFor="project-technology">Technology</label>
            <select id="project-technology" value={tech ?? ""} onChange={(event) => setTech(event.target.value || null)}>
              <option value="">All technologies</option>
              {STACK.map(({ name }) => (
                <option key={name} value={name} disabled={filterProjects(projects, status, name).length === 0}>
                  {name} ({filterProjects(projects, status, name).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        <p aria-live="polite" className="font-mono text-xs text-text-muted flex items-center gap-3 min-h-5">
          Showing {shown.length} of {projects.length}
          {filtered && (
            <button type="button" onClick={clear} className="link-underline text-text-main">
              Clear filters
            </button>
          )}
        </p>
      </div>

      {shown.length ? (
        <div className="site-gutter">
          {shown.map((project) => (
            <ProjectCard key={project.title} project={project} activeTech={tech} />
          ))}
        </div>
      ) : (
        <div className="site-gutter py-16 text-center">
          <p className="font-semibold text-text-main">No projects match these filters.</p>
          <p className="mt-1 text-sm text-text-muted">Try a different status or stack.</p>
          <button type="button" onClick={clear} className="modern-btn-outline mt-6">
            Clear filters
          </button>
        </div>
      )}
    </>
  );
}
