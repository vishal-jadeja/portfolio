"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import SiteSearch from "@/components/search/SiteSearch";
import SearchButton from "@/components/search/SearchButton";
import { TbExternalLink } from "react-icons/tb";

// Root-relative so they also work from /projects; on the home page they only scroll.
function navLinks(pathname: string) {
  return [
    ...(pathname !== "/" ? [{ label: "Home", href: "/" }] : []),
    { label: "Projects", href: pathname === "/projects" ? "/projects" : "/#projects" },
    { label: "Blog", href: "/blog" },
    { label: "Experience", href: "/#experience" },
    { label: "Contact", href: "/#contact" },
  ];
}

// `pathname` comes from the server-rendered page rather than usePathname(), which
// can disagree with the client during on-demand revalidation and cause a
// hydration mismatch that makes React client-render the whole document.
export default function Navbar({ pathname }: { pathname: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const links = navLinks(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b ${scrolled ? "bg-[var(--theme-bg)] border-[var(--theme-border-main)]" : "bg-[var(--theme-bg)] border-[var(--theme-border-main)]"}`}
    >
      <nav className="site-gutter h-14 flex items-center justify-between gap-4">
        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-5 flex-1">
          {links.map((link) => (
            <li key={link.label}>
              <motion.a
                href={link.href}
                aria-current={link.href === pathname ? "page" : undefined}
                whileHover={reduceMotion ? undefined : { y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="text-text-muted hover:text-text-main aria-[current=page]:text-text-main text-sm font-medium transition-colors duration-150"
              >
                {link.label}
              </motion.a>
            </li>
          ))}
        </ul>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          title="View resume (PDF, opens in a new tab)"
          aria-label="View resume (PDF, opens in a new tab)"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border-main px-3 text-sm font-medium text-text-muted hover:text-text-main hover:border-text-muted transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-main"
        >
          <span className="leading-none">Resume</span>
          <TbExternalLink size={14} className="block shrink-0" aria-hidden="true" />
        </a>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <SearchButton variant="pill" />
          <ThemeToggle />
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-3">
          <SearchButton
            variant="icon"
            className="w-8 h-8 flex items-center justify-center rounded-md border border-border-main text-text-muted hover:text-text-main hover:border-text-muted transition-all duration-150"
          />
          <ThemeToggle />
          <button
            className="flex flex-col gap-[5px] p-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="portfolio-mobile-navigation"
          >
            <span className={`block w-5 h-0.5 bg-text-muted transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-5 h-0.5 bg-text-muted transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-text-muted transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="portfolio-mobile-navigation" className="md:hidden border-t border-[var(--glass-border)] bg-bg site-gutter py-4 flex flex-col gap-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              aria-current={link.href === pathname ? "page" : undefined}
              className="text-text-muted hover:text-text-main aria-[current=page]:text-text-main text-sm font-medium py-2.5 border-b border-[var(--glass-border)] last:border-b-0 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
      <SiteSearch />
    </header>
  );
}
