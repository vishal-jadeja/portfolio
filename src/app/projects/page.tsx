import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";
import { socials } from "@/data/socials";
import { PERSON, SITE_NAME, SITE_URL, X_HANDLE, absoluteUrl, pageRobots } from "@/lib/seo";
import PortfolioShell from "@/components/PortfolioShell";
import SectionDivider from "@/components/SectionDivider";
import ProjectsIndex from "@/components/projects/ProjectsIndex";

const PAGE_URL = `${SITE_URL}/projects`;
const DESCRIPTION = `Every project ${PERSON.name} has built — production systems, AI tooling and side projects — each with its source on GitHub.`;
// A page-level `openGraph` replaces the root's file-based image, so name it explicitly.
const IMAGE = { width: 1200, height: 630, alt: `${PERSON.name} — ${PERSON.jobTitle}` };
const GITHUB_PROFILE = socials.find((s) => s.name === "GitHub")?.url ?? "https://github.com/vishal-jadeja";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: `Projects · ${SITE_NAME}`,
    description: DESCRIPTION,
    url: PAGE_URL,
    siteName: `${SITE_NAME} Portfolio`,
    type: "website",
    locale: "en_US",
    images: [{ url: `${SITE_URL}/opengraph-image`, ...IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: `Projects · ${SITE_NAME}`,
    description: DESCRIPTION,
    site: X_HANDLE,
    creator: X_HANDLE,
    images: [{ url: `${SITE_URL}/twitter-image`, ...IMAGE }],
  },
  robots: pageRobots(),
};

function structuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    url: PAGE_URL,
    name: `Projects by ${PERSON.name}`,
    description: DESCRIPTION,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: projects.length,
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "SoftwareSourceCode",
          name: project.title,
          description: project.description,
          codeRepository: project.github,
          url: project.live ?? project.github,
          image: project.imageUrl ? absoluteUrl(project.imageUrl) : undefined,
          keywords: project.techStack.join(", "),
          author: { "@id": `${SITE_URL}/#person` },
        },
      })),
    },
  };
}

export default function ProjectsPage() {
  // Escape `<` so no data value can terminate the script element early.
  const json = JSON.stringify(structuredData()).replace(/</g, "\\u003c");

  return (
    <PortfolioShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />

      <header className="px-5 sm:px-8 pt-10 sm:pt-14 pb-8 anim-fade-up">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-main transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <h1 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight text-text-main">
          Projects
        </h1>
        <p className="mt-4 max-w-[60ch] text-text-muted leading-relaxed">
          Everything I&apos;ve built — production systems, AI tooling, and the side
          projects that taught me the most. Each one links to its source on GitHub.
        </p>
      </header>

      <ProjectsIndex />

      <SectionDivider />

      <section aria-labelledby="projects-more" className="px-5 sm:px-8 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--theme-card)] p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 dot-grid-bg opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
          />
          <div className="relative">
            <h2 id="projects-more" className="text-2xl font-bold tracking-tight text-text-main">
              Building something similar?
            </h2>
            <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-text-muted">
              I&apos;m happy to talk through any of these, or about what you&apos;re working on.
              Smaller experiments and contributions live on my GitHub.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href="/#contact" className="modern-btn">
                Get in touch
              </Link>
              <a href={GITHUB_PROFILE} target="_blank" rel="noopener noreferrer" className="modern-btn-outline">
                GitHub profile
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
