'use client';

import Image from 'next/image';
import { email, socials } from '@/data/socials';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TbCheck, TbCopy } from 'react-icons/tb';
import SocialIcon from '@/components/SocialIcon';

const GITHUB_AVATAR = 'https://avatars.githubusercontent.com/vishal-jadeja';


function ViewCounterHero() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch('/api/views?page=/')
      .then((r) => r.json())
      .then((data) => { if (typeof data.count === "number") setCount(data.count); })
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  async function copyEmail() {
    setCopyStatus('idle');
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  return (
    <section id="hero" className="px-5 sm:px-8 py-10 sm:py-14 bg-bg">
      <div className="max-w-[var(--site-width)] mx-auto">

        {/* ── Profile card ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 sm:gap-5"
        >
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden">
              <Image
                src={GITHUB_AVATAR}
                alt="Vishal Jadeja"
                width={120}
                height={120}
                className="object-cover w-full h-full"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Text block */}
          <div className="flex flex-col gap-0.5 min-w-0 font-sans">
            <h1 className="font-semibold text-text-main text-[24px] sm:text-[26px] leading-tight tracking-tight">
              Vishal Jadeja
              <span className="sr-only">{' '}— Software Developer</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-text-muted text-sm leading-relaxed">
              <span>Software Engineer <span aria-hidden="true">·</span> Builder</span>
              <span className="inline-flex items-center gap-1.5 min-w-0 max-w-full">
                <span className="hidden md:inline" aria-hidden="true">·</span>
                <a href={`mailto:${email}`} className="break-all hover:text-text-main transition-colors">{email}</a>
                <button
                  type="button"
                  onClick={copyEmail}
                  aria-label="Copy email address"
                  title={copyStatus === 'copied' ? 'Email copied' : 'Copy email address'}
                  className="inline-flex h-7 w-auto shrink-0 items-center justify-center rounded-sm hover:text-text-main transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-main"
                >
                  {copyStatus === 'copied' ? <TbCheck size={16} strokeWidth={1.5} aria-hidden="true" /> : <TbCopy size={16} strokeWidth={1.5} aria-hidden="true" />}
                </button>
              </span>
            </div>
            <span role="status" className={copyStatus === 'error' ? 'text-xs text-text-muted' : 'sr-only'}>
              {copyStatus === 'copied' ? 'Email copied' : copyStatus === 'error' ? 'Could not copy. Select the email address to copy it.' : ''}
            </span>
            <motion.nav
              aria-label="Social profiles"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.2 } },
              }}
              initial="hidden"
              animate="visible"
              className="flex items-center flex-wrap -ml-1.5"
            >
              {socials.map((social) => (
                <motion.a
                  key={social.name}
                  variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted hover:text-text-main transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-main"
                >
                  <SocialIcon name={social.name} />
                </motion.a>
              ))}
              <span className="ml-3"><ViewCounterHero /></span>
            </motion.nav>
          </div>
        </motion.div>
        <p className="mt-5 text-sm text-text-muted leading-relaxed">
          Building cool things, creating content, and learning a little bit of everything.
        </p>

      </div>
    </section>
  );
}
