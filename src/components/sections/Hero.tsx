'use client';

import Image from 'next/image';
import { socials } from '@/data/socials';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const GITHUB_AVATAR = 'https://avatars.githubusercontent.com/vishal-jadeja';

const TAGLINE_ITEMS = ['Software Engineer', 'Software Developer', 'Builder'];

function ViewCounterHero() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/views?page=/')
      .then((r) => r.json())
      .then((data) => setCount(data.count))
      .catch(() => { });
  }, []);
  if (count === null) return null;
  return (
    <span className="flex items-center gap-1.5 text-text-muted font-mono text-xs opacity-70">
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {count?.toLocaleString()}
    </span>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="px-5 sm:px-8 py-10 sm:py-14 bg-bg">
      <div className="max-w-[840px] mx-auto">

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-6 sm:gap-10"
        >
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.04 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="relative shrink-0"
          >
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[var(--glass-border)] shadow-[0_0_0_4px_rgba(255,255,255,0.04)]">
              <Image
                src={GITHUB_AVATAR}
                alt="Vishal Jadeja"
                width={144}
                height={144}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
          </motion.div>

          {/* Text block */}
          <div className="flex flex-col gap-2 sm:gap-3 min-w-0">

            {/* Name + verified badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="font-bold text-text-main text-3xl sm:text-5xl leading-none tracking-tight"
              >
                Vishal Jadeja
                <span className="sr-only">
                  {' '}— Software Developer
                </span>
              </h1>
              {/* Blue verified-style badge */}
              <svg
                className="shrink-0 mt-0.5"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle cx="12" cy="12" r="11" fill="#3b82f6" />
                <path
                  d="M7.5 12.5l3 3 6-6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Dot-separated tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex items-center gap-0 flex-wrap"
            >
              {TAGLINE_ITEMS.map((item, i) => (
                <span key={item} className="flex items-center">
                  <span className="text-text-muted text-sm sm:text-base font-mono">{item}</span>
                  {i < TAGLINE_ITEMS.length - 1 && (
                    <span className="text-text-muted mx-2 text-sm opacity-40">·</span>
                  )}
                </span>
              ))}
              <span className="ml-3">
                <ViewCounterHero />
              </span>
            </motion.div>

            {/* Social icons — plain colored, no border box */}
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
              }}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3 flex-wrap"
            >
              {socials.map((s) => (
                <motion.a
                  key={s.name}
                  variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                  whileHover={{ y: -2, scale: 1.18 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="opacity-70 hover:opacity-100 transition-opacity duration-150"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={s.color}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d={s.icon} />
                  </svg>
                </motion.a>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* ── Bio ── */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-text-muted text-sm sm:text-base leading-relaxed mt-8 mb-7 max-w-lg font-mono"
        >
          Building scalable back-end systems and clean front-end interfaces.
          Shipping real-time products at Glitchover — from WebSocket infra to
          payment integrations.
        </motion.p>

        {/* ── CTAs ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className="flex items-center gap-3 flex-wrap"
        >
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="modern-btn text-sm px-5 py-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Resume
          </a>
          <a href="#contact" className="modern-btn-outline text-sm px-5 py-2">
            Get in touch
          </a>
        </motion.div>

      </div>
    </section>
  );
}
