"use client";

import { motion } from "framer-motion";
import { email } from "@/data/socials";

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute w-4 h-4 text-[var(--theme-border-main)]";
  const cls = {
    tl: `${base} top-0 left-0 -translate-x-1/2 -translate-y-1/2`,
    tr: `${base} top-0 right-0 translate-x-1/2 -translate-y-1/2`,
    bl: `${base} bottom-0 left-0 -translate-x-1/2 translate-y-1/2`,
    br: `${base} bottom-0 right-0 translate-x-1/2 translate-y-1/2`,
  }[pos];

  return (
    <motion.svg
      className={cls}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      animate={{ opacity: [0.4, 0.9, 0.4] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <line x1="8" y1="0" x2="8" y2="16" />
      <line x1="0" y1="8" x2="16" y2="8" />
    </motion.svg>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="py-0 bg-bg overflow-hidden">

      {/* Main card area */}
      <div className="site-gutter py-8">
        <div className="max-w-[840px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55 }}
            className="relative border border-[var(--glass-border)] bg-[var(--theme-bg)] dark:bg-[radial-gradient(35%_80%_at_25%_0%,rgba(255,255,255,0.05),transparent)] rounded-sm px-8 py-12 flex flex-col items-center text-center gap-6 overflow-visible"
          >
            {/* Corner crosshairs */}
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />

            <div>
              <h2 className="section-title">
                Let&apos;s work together
              </h2>
              <p className="section-description max-w-sm">
                Have a project in mind? Let&apos;s create something amazing.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <motion.a
                href={`mailto:${email}`}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="modern-btn-outline px-6 py-2.5"
              >
                Email Me
              </motion.a>
              <motion.a
                href="https://cal.com/vishal-jadeja"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className="modern-btn px-6 py-2.5"
              >
                Book a Call
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
