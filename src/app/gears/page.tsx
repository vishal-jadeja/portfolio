import type { Metadata } from "next";
import Link from "next/link";
import PortfolioShell from "@/components/PortfolioShell";
import Gears from "@/components/sections/Gears";
import { SITE_URL, pageRobots } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Gears",
  description: "The hardware, software, browser extensions, AI tools, and music services I use to build and create.",
  alternates: { canonical: `${SITE_URL}/gears` },
  robots: pageRobots(),
};

export default function GearsPage() {
  return (
    <PortfolioShell>
      <div className="gears-page">
        <header className="gears-page-header">
          <Link href="/#gears" className="inline-flex items-center gap-2 text-xs text-text-muted hover:text-text-main focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-text-main">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5m7 7-7-7 7-7" /></svg>
            Back to home
          </Link>
          <h1 className="mt-6 text-[26px] font-semibold tracking-tight text-text-main">Gears</h1>
          <p className="mt-3 text-sm text-text-muted leading-relaxed">The tools behind the code and the videos.</p>
        </header>
        <Gears />
      </div>
    </PortfolioShell>
  );
}
