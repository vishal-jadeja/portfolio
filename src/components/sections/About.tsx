"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="bg-bg py-8 px-5 sm:px-8">
      <div className="max-w-[840px] mx-auto">

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.45 }}
          className="font-bold text-text-main text-2xl mb-6"
        >
          About
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-4"
        >
          <p className="text-text-main text-xl md:text-2xl font-semibold leading-snug tracking-tight">
            I build scalable backend systems and real-time applications.
          </p>

          <p className="text-text-muted text-base leading-relaxed">
            I&apos;m a <strong className="text-text-main font-semibold">Software Developer</strong> focused on
            <strong className="text-text-main font-semibold"> backend architecture, distributed systems, and real-time infrastructure</strong>.
            Currently working at{' '}
            <a href="https://glitchover.com" target="_blank" rel="noopener noreferrer"
              className="text-text-main font-semibold link-underline">
              Glitchover
            </a>
            , where I design and build production systems that power competitive gaming platforms.
          </p>

          <p className="text-text-muted text-base leading-relaxed">
            I specialize in the <strong className="text-text-main font-semibold">MERN stack</strong> and building
            high-performance APIs, event-driven systems, and scalable backend services.
            I enjoy solving complex engineering problems — from optimizing database queries
            and eliminating race conditions to designing resilient backend systems.
          </p>

          <p className="text-text-muted text-base leading-relaxed">
            Outside of work, I deep-dive into
            <strong className="text-text-main font-semibold"> system design, distributed systems, and scalable architectures</strong>,
            and enjoy solving algorithmic problems on LeetCode.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
