export type SearchKind =
  | "page"
  | "article"
  | "project"
  | "experience"
  | "skill"
  | "topic"
  | "link";

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  /** Shown under the title. */
  subtitle?: string;
  /** Short right-aligned label, e.g. a date or status. */
  meta?: string;
  /** Matched with high weight but never displayed (tags, tech stack). */
  keywords?: string[];
  /** Matched with low weight but never displayed (long descriptions). */
  body?: string;
  href: string;
  external?: boolean;
}

/** Display order for result groups when scores tie, and their headings. */
export const KIND_LABELS: Record<SearchKind, string> = {
  page: "Sections",
  article: "Articles",
  project: "Projects",
  experience: "Experience",
  skill: "Skills",
  topic: "Topics",
  link: "Links",
};
