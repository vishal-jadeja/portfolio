import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/data/projects";
import { socials } from "@/data/socials";
import { PERSON, SITE_URL, absoluteUrl, pageRobots, pageSocial } from "@/lib/seo";
import PortfolioShell from "@/components/PortfolioShell";
import SectionDivider from "@/components/SectionDivider";
import ProjectsIndex from "@/components/projects/ProjectsIndex";

const PAGE_URL = `${SITE_URL}/projects`;
const DESCRIPTION = `Every project ${PERSON.name} has built — production systems, AI tooling and side projects — each with its source on GitHub.`;
const GITHUB_PROFILE = socials.find((s) => s.name === "GitHub")?.url ?? "https://github.com/vishal-jadeja";

export const metadata: Metadata = {
  title: "Projects",
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  ...pageSocial({ path: "/projects", title: "Projects", description: DESCRIPTION }),
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
    <PortfolioShell pathname="/projects">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />

      <header className="site-gutter pt-8 pb-6 anim-fade-up">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-text-muted hover:text-text-main transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Home
        </Link>
        <h1 className="section-title page-title">
          Projects
        </h1>
        <p className="section-description max-w-[60ch]">
          A few things I&apos;ve built — AI tools, web apps, and useful experiments.
        </p>
      </header>

      <ProjectsIndex />

      <SectionDivider />

      <section aria-labelledby="projects-more" className="site-gutter py-12">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--glass-border)] bg-[var(--theme-card)] p-7 sm:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 dot-grid-bg opacity-60 [mask-image:linear-gradient(to_left,black,transparent_70%)]"
          />
          <div className="relative">
            <h2 id="projects-more" className="section-title">
              Building something similar?
            </h2>
            <p className="section-description max-w-[52ch]">
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
