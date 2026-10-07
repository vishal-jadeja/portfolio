import type { Project } from "@/data/projects";

export type StatusFilter = "all" | "shipped" | "in-progress";

/** Projects without an explicit status are finished work. */
export const isInProgress = (p: Project) => p.status === "in-progress";

export const statusLabel = (p: Project) => (isInProgress(p) ? "In progress" : "Shipped");

// Names that differ only in branding; everything else is grouped by stripping a version.
const ALIASES: Record<string, string> = {
  "react.js": "React",
  postgresql: "Postgres",
  "neon postgres": "Postgres",
  "upstash redis": "Redis",
  nextauth: "Auth.js",
};

/** "Next.js 16" → "Next.js", "Tailwind CSS v4" → "Tailwind CSS", "PostgreSQL" → "Postgres". */
export function techFamily(tech: string) {
  const base = tech.replace(/\s+v?\d+(\.\d+)*$/i, "").trim();
  return ALIASES[base.toLowerCase()] ?? base;
}

export const usesTech = (p: Project, family: string) =>
  p.techStack.some((t) => techFamily(t) === family);

/** Stack filters worth offering: technologies shared by at least two projects, most used first. */
export function sharedTech(list: Project[]) {
  const counts = new Map<string, number>();
  for (const p of list)
    for (const family of new Set(p.techStack.map(techFamily)))
      counts.set(family, (counts.get(family) ?? 0) + 1);
  // Map keeps first-seen order, and sort is stable, so ties stay in data order.
  return [...counts]
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}

export function filterProjects(list: Project[], status: StatusFilter, tech: string | null) {
  return list.filter(
    (p) =>
      (status === "all" || (status === "in-progress") === isInProgress(p)) &&
      (!tech || usesTech(p, tech)),
  );
}
