import Navbar from "@/components/Navbar";
import PortfolioEnhancements from "@/components/PortfolioEnhancements";
import ViewCounter from "@/components/ViewCounter";

/** The bordered single-column frame shared by the home page and /projects. */
export default function PortfolioShell({
  children,
  showViews = false,
}: {
  children: React.ReactNode;
  showViews?: boolean;
}) {
  return (
    <div className="portfolio-shell max-w-[var(--site-width)] mx-auto min-h-screen bg-bg border-x border-border-main">
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
      <Navbar />
      <PortfolioEnhancements />
      <main id="main-content">{children}</main>
      <footer className="border-t border-[var(--glass-border)] py-8 site-gutter bg-bg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-sans font-semibold text-text-main text-sm">
            Vishal Jadeja
          </span>
          <div className="flex items-center gap-4">
            {showViews && <ViewCounter />}
            <span className="font-mono text-text-muted text-xs">
              © {new Date().getFullYear()} · Built with Next.js + TypeScript
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
