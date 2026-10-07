import { projects } from "@/data/projects";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import { socials } from "@/data/socials";
import { normalize } from "./match";
import type { SearchEntry } from "./types";

export function slugify(value: string) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** DOM id of a project card on the home page; search links deep into it. */
export const projectAnchorId = (title: string) => `project-${slugify(title)}`;

const sections: SearchEntry[] = [
  { id: "page:home", kind: "page", title: "Home", subtitle: "Back to the top of the portfolio", href: "/#top", keywords: ["intro", "hero", "top", "vishal jadeja"] },
  { id: "page:about", kind: "page", title: "About", subtitle: "Who I am and what I work on", href: "/#about", keywords: ["bio", "background", "me"] },
  { id: "page:experience", kind: "page", title: "Experience", subtitle: "Work history", href: "/#experience", keywords: ["work", "jobs", "career", "resume", "cv"] },
  { id: "page:projects", kind: "page", title: "Projects", subtitle: "Things I've built", href: "/#projects", keywords: ["portfolio", "side projects", "work"] },
  { id: "page:skills", kind: "page", title: "Skills", subtitle: "Languages, frameworks and tools", href: "/#skills", keywords: ["tech stack", "technologies", "tools"] },
  { id: "page:contributions", kind: "page", title: "GitHub activity", subtitle: "Contribution graph", href: "/#contributions", keywords: ["github", "contributions", "commits", "open source"] },
  { id: "page:blog", kind: "page", title: "Blog", subtitle: "All articles", href: "/blog", keywords: ["writing", "articles", "posts", "notes"] },
  { id: "page:contact", kind: "page", title: "Contact", subtitle: "Get in touch", href: "/#contact", keywords: ["email", "hire", "reach out"] },
];

/** Everything searchable that ships with the code; blog content comes from /api/search. */
export function staticSearchEntries(): SearchEntry[] {
  return [
    ...sections,
    ...projects.map((p) => ({
      id: `project:${slugify(p.title)}`,
      kind: "project" as const,
      title: p.title,
      subtitle: p.tagline,
      meta: p.status === "in-progress" ? "In progress" : undefined,
      keywords: p.techStack,
      body: `${p.description} ${p.highlights.join(" ")}`,
      href: `/#${projectAnchorId(p.title)}`,
    })),
    ...experiences.map((e) => ({
      id: `experience:${slugify(`${e.company} ${e.role}`)}`,
      kind: "experience" as const,
      title: `${e.role} · ${e.company}`,
      subtitle: e.period,
      meta: e.type,
      keywords: [e.company],
      body: e.description,
      href: "/#experience",
    })),
    ...skillCategories.map((c) => ({
      id: `skill:${slugify(c.title)}`,
      kind: "skill" as const,
      title: c.title,
      subtitle: c.skills.join(", "),
      keywords: c.skills,
      href: "/#skills",
    })),
    ...socials.map((s) => ({
      id: `link:${slugify(s.name)}`,
      kind: "link" as const,
      title: s.name,
      subtitle: s.url.replace(/^(https?:\/\/|mailto:)/, ""),
      href: s.url,
      external: true,
    })),
  ];
}
