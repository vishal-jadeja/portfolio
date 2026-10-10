'use client';

import Image from 'next/image';
import { email, socials, type Social } from '@/data/socials';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { TbArrowUpRight, TbCheck, TbCopy } from 'react-icons/tb';
import SocialIcon from '@/components/SocialIcon';

const GITHUB_AVATAR = 'https://avatars.githubusercontent.com/vishal-jadeja';

/**
 * Preview shown below a social icon on hover or keyboard focus. Touch-only
 * devices never see it (Tailwind's hover variants require `(hover: hover)`),
 * so a tap still goes straight to the profile.
 */
function SocialCard({ social }: { social: Social }) {
  // White brand marks (X, GitHub) would vanish in light mode; use the text colour.
  const tint = social.color.toLowerCase() === '#ffffff' ? 'var(--theme-text-main)' : social.color;
  return (
    <span
      id={`social-card-${social.name.toLowerCase()}`}
      role="tooltip"
      className="pointer-events-none absolute top-full left-1/2 z-30 mt-2 w-64 -translate-x-1/2 -translate-y-1 rounded-xl border border-[var(--glass-border)] bg-[var(--theme-card)] p-3.5 text-left opacity-0 shadow-[0_12px_32px_rgba(0,0,0,0.28)] invisible transition-[opacity,transform,visibility] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:delay-150 group-has-[:focus-visible]:visible group-has-[:focus-visible]:translate-y-0 group-has-[:focus-visible]:opacity-100"
    >
      <span className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ color: tint, background: `color-mix(in srgb, ${tint} 14%, transparent)` }}
        >
          <SocialIcon name={social.name} size={17} />
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold leading-tight text-text-main">{social.name}</span>
          <span className="truncate font-mono text-[11px] leading-tight text-text-muted">{social.handle}</span>
        </span>
      </span>
      <span className="mt-2.5 block text-[13px] leading-snug text-text-muted">{social.blurb}</span>
      <span className="mt-2.5 flex items-center gap-1 border-t border-[var(--glass-border)] pt-2 font-mono text-[11px] text-text-muted">
        {social.url.startsWith('mailto:') ? 'Click to email' : `Open ${social.name}`}
        <TbArrowUpRight size={12} aria-hidden="true" />
      </span>
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
    <section id="hero" className="site-gutter py-10 sm:py-14 bg-bg">
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
                <motion.span
                  key={social.name}
                  variants={{ hidden: { opacity: 0, y: 5 }, visible: { opacity: 1, y: 0 } }}
                  className="group relative"
                >
                  <a
                    href={social.url}
                    target={social.url.startsWith('mailto:') ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    aria-describedby={`social-card-${social.name.toLowerCase()}`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-text-muted hover:text-text-main transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-main"
                  >
                    <SocialIcon name={social.name} />
                  </a>
                  <SocialCard social={social} />
                </motion.span>
              ))}
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
