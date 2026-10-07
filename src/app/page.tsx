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

export default function Home() {
  return (
    <div className="portfolio-shell max-w-[840px] mx-auto min-h-screen bg-bg border-x border-border-main">
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
