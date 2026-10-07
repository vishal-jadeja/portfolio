"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import SiteSearch from "@/components/search/SiteSearch";
import SearchButton from "@/components/search/SearchButton";

// Root-relative so they also work from /projects; on the home page they only scroll.
function navLinks(pathname: string) {
  return [
    { label: "About", href: "/#about" },
    { label: "Experience", href: "/#experience" },
    { label: "Projects", href: pathname === "/projects" ? "/projects" : "/#projects" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ];
}

function openChat() {
  window.dispatchEvent(new CustomEvent("openChat"));
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
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
      <nav className="px-5 sm:px-8 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link
          href="/#top"
          className="font-mono font-bold text-text-main text-sm tracking-widest hover:text-text-muted transition-colors shrink-0"
        >
          VJ
        </Link>

        {/* Desktop links — centered */}
        <ul className="hidden md:flex items-center gap-5 flex-1">
          {links.map((link) => (
            <li key={link.label}>
              <motion.a
                href={link.href}
                aria-current={link.href === pathname ? "page" : undefined}
                whileHover={{ y: -1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="text-text-muted hover:text-text-main aria-[current=page]:text-text-main text-sm font-medium transition-colors duration-150"
              >
                {link.label}
              </motion.a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <SearchButton variant="pill" />
          <button
            onClick={openChat}
            className="text-sm font-medium text-text-muted hover:text-text-main transition-colors flex items-center gap-1.5 border border-solid border-[var(--glass-border)] px-4 py-1 h-8 rounded-full hover:scale-105"
            aria-label="Talk to AI"
          >
            Talk to AI
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sparkles text-muted-foreground/60 group-hover:text-primary transition-colors" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"></path><path d="M20 2v4"></path><path d="M22 4h-4"></path><circle cx="4" cy="20" r="2"></circle></svg>
          </button>
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
        <div id="portfolio-mobile-navigation" className="md:hidden border-t border-[var(--glass-border)] bg-bg px-5 py-4 flex flex-col gap-1">
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
          <button
            onClick={() => { openChat(); setMenuOpen(false); }}
            className="text-sm text-text-muted font-medium text-left pt-3"
          >
            Talk to AI ✦
          </button>
        </div>
      )}
      <SiteSearch />
    </header>
  );
}
