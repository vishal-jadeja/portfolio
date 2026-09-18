import { socials } from "@/data/socials";
import { skillCategories } from "@/data/skills";

/**
 * Canonical origin. Overridable per-environment so Vercel preview deploys
 * canonicalize to themselves instead of pointing at production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.vishaljadeja.xyz";

export const SITE_NAME = "Vishal Jadeja";

/** X / Twitter handle, with the leading @. Set to null to drop the tags. */
export const X_HANDLE = "@ViShallTalk";

export const YOUTUBE_URL = "https://www.youtube.com/@ViShallTalk";
export const X_URL = "https://x.com/ViShallTalk";

export const GITHUB_AVATAR =
  "https://avatars.githubusercontent.com/vishal-jadeja";

export const PERSON = {
  name: "Vishal Jadeja",
  givenName: "Vishal",
  familyName: "Jadeja",
  jobTitle: "Software Engineer",
  employer: "Glitchover",
  email: "vishaljadeja.work@gmail.com",
  headline: "Vishal Jadeja | Software Engineer",
  description:
    "Full Stack Engineer specializing in scalable backend systems, real-time architecture, microservices, and high-performance APIs. MERN stack expert with 1500+ concurrent user systems.",
  shortDescription:
    "Full Stack Engineer building scalable backend systems and real-time architecture.",
} as const;

/**
 * Profile URLs for schema.org `sameAs`. Built from the rendered socials so the
 * two never drift, plus the profiles that have no button in the UI.
 */
export const sameAs: string[] = [
  ...socials
    .filter((s) => !s.url.startsWith("mailto:"))
    .map((s) => s.url),
  X_URL,
  YOUTUBE_URL,
];

/** Flat technology list for schema.org `knowsAbout`. */
export const knowsAbout: string[] = skillCategories.flatMap((c) => c.skills);

export const absoluteUrl = (path: string) =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
