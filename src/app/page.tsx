import type { Metadata } from "next";
import { PERSON, SITE_NAME, SITE_URL, X_HANDLE, pageRobots } from "@/lib/seo";
import ViewCounter from "@/components/ViewCounter";
import Blog from "@/components/sections/Blog";
import PortfolioEnhancements from "@/components/PortfolioEnhancements";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Experience from "@/components/sections/Experience";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import GitHubContributions from "@/components/sections/GitHubContributions";
import Quote from "@/components/sections/Quote";
import Contact from "@/components/sections/Contact";
import SectionDivider from "@/components/SectionDivider";

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
    <div className="portfolio-shell max-w-[840px] mx-auto min-h-screen bg-bg border-x border-border-main">
      <noscript>
        <style>{`
          .portfolio-shell main [style*="opacity:0"],
          .portfolio-shell main [style*="opacity: 0"] {
            opacity: 1 !important;
            transform: none !important;
          }
          .portfolio-shell main [style*="height:0"],
          .portfolio-shell main [style*="height: 0"] {
            height: auto !important;
          }
        `}</style>
      </noscript>
      <JsonLd />
      <Navbar />
      <PortfolioEnhancements />
      <main id="main-content">
        <Hero />
        <SectionDivider />
        <About />
        <SectionDivider />
        <Experience />
        <SectionDivider />
        <Projects />
        <SectionDivider />
        <Skills />
        <SectionDivider />
        <GitHubContributions />
        <SectionDivider />
        <Blog />
        <SectionDivider />
        <Quote />
        <SectionDivider />
        <Contact />
      </main>
      <footer className="border-t border-[var(--glass-border)] py-8 px-5 sm:px-8 bg-bg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-sans font-semibold text-text-main text-sm">
            Vishal Jadeja
          </span>
          <div className="flex items-center gap-4">
            <ViewCounter />
            <span className="font-mono text-text-muted text-xs">
              © {new Date().getFullYear()} · Built with Next.js + TypeScript
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
