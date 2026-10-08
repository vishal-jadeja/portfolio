import type { Metadata } from "next";
import Link from "next/link";
import { PERSON, SITE_NAME, SITE_URL, X_HANDLE, pageRobots } from "@/lib/seo";
import Blog from "@/components/sections/Blog";
import PortfolioShell from "@/components/PortfolioShell";
import JsonLd from "@/components/JsonLd";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import GitHubContributions from "@/components/sections/GitHubContributions";
import Quote from "@/components/sections/Quote";
import Contact from "@/components/sections/Contact";
import SectionDivider from "@/components/SectionDivider";
import Personal from "@/components/sections/Personal";

export const metadata: Metadata = {
  title: { absolute: PERSON.headline },
  description: PERSON.description,
  keywords: [
    PERSON.name,
    "Software Developer",
    "Software Engineer",
    "Backend Engineer",
    "Scalable Systems",
    "MERN Stack",
    "Node.js",
    "TypeScript",
  ],
  alternates: {
    canonical: SITE_URL,
    types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
  },
  openGraph: {
    title: PERSON.headline,
    description: PERSON.shortDescription,
    url: SITE_URL,
    siteName: `${SITE_NAME} Portfolio`,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: PERSON.headline,
    description: PERSON.shortDescription,
    site: X_HANDLE,
    creator: X_HANDLE,
  },
  robots: pageRobots(),
};

export default function Home() {
  return (
    <PortfolioShell showViews>
      <JsonLd />
      <Hero />
      <SectionDivider />
      <Experience />
      <SectionDivider />
      <Blog />
      <SectionDivider />
      <Projects />
      <SectionDivider />
      <About />
      <SectionDivider />
      <GitHubContributions />
      <SectionDivider />
      <Skills />
      <SectionDivider />
      <section id="gears" className="py-8 site-gutter bg-bg">
        <h2 className="section-title section-title-spaced">Gears</h2>
        <Link href="/gears" className="group flex items-center justify-between gap-4 py-4 border-y border-border-main focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-main">
          <span>
            <span className="block font-medium text-text-main">My everyday setup</span>
            <span className="block text-sm text-text-muted mt-1">Hardware, software, browser extensions, AI, and music.</span>
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0 text-text-muted group-hover:text-text-main" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
        </Link>
      </section>
      <Personal />
      <Quote />
      <SectionDivider />
      <Contact />
    </PortfolioShell>
  );
}
