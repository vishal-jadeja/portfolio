import type { Metadata } from "next";
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
      <Skills />
      <SectionDivider />
      <GitHubContributions />
      <SectionDivider />
      <Personal />
      <SectionDivider />
      <Quote />
      <SectionDivider />
      <Contact />
    </PortfolioShell>
  );
}
