'use client';

import { motion } from 'framer-motion';

export default function Quote() {
  return (
    <section id="quote" className="py-8 site-gutter bg-bg overflow-hidden">
      <div className="max-w-[840px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative modern-card px-5 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center gap-6 overflow-hidden"
        >
          {/* Large decorative quote mark */}
          <div
            className="absolute -top-4 -left-2 text-[6rem] leading-none font-serif text-text-main select-none pointer-events-none"
            style={{ opacity: 0.04 }}
            aria-hidden="true"
          >
            &#8220;
          </div>

          {/* Quote text */}
          <div className="flex-1 relative z-10">
            <blockquote className="font-sans font-semibold text-text-main text-lg sm:text-xl leading-relaxed tracking-tight">
              &#8220;You don&apos;t get what you wish for,
              you get what you work for.&#8221;
            </blockquote>
            <cite className="block mt-3 text-text-muted text-xs font-medium not-italic">
              — Virat Kohli
            </cite>
          </div>

          {/* Right side decorative element */}
          <div className="shrink-0 hidden sm:flex items-center justify-center w-16 h-16 rounded-full border border-[var(--glass-border)] bg-[var(--theme-card)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-text-muted opacity-60">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
