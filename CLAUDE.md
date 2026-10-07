# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
```

`npm test` runs content, SEO, and Postgres integration tests.

## Stack

- **Next.js 16.1.6** — App Router only. No `pages/` directory exists.
- **React 19.2.3** — Use server components where possible; sections are all `"use client"` due to Framer Motion.
- **Tailwind CSS v4** — Config is in `postcss.config.mjs` via `@tailwindcss/postcss`. There is no `tailwind.config.*` file. Theme tokens are declared inside `globals.css` using `@theme inline {}`.
- **TypeScript** — Path alias `@/*` maps to `./src/*`.

## Architecture

This is a single-page portfolio. `src/app/page.tsx` renders all sections sequentially. Blog routes, a private owner studio, and API routes are implemented. See docs/blog-setup.md and docs/blog-architecture-plan.md.

**Data flow:** Static TypeScript objects in `src/data/` → imported directly into section components → no server fetching, no state management library.

**Content to update lives in:**

- `src/data/experience.ts` — work history
- `src/data/projects.ts` — project cards
- `src/data/skills.ts` — skill categories
- `src/data/socials.ts` — social links and email

## Styling System

All styles live in `src/app/globals.css`. Dark mode is toggled by adding/removing the `.dark` class on `<html>` — **not** via `prefers-color-scheme` media query. The theme is stored in `localStorage` under the key `'theme'`.

**CSS variables** (available via Tailwind as `bg-bg`, `text-text-main`, etc.):

- `--theme-bg`, `--theme-surface`, `--theme-card` — background layers
- `--theme-text-main`, `--theme-text-muted`, `--theme-border-main`
- `--color-accent: #FFE600`, `--color-accent-red`, `--color-accent-blue`

**Fonts** (loaded locally via `next/font/local` in `layout.tsx`, referenced as CSS variables):

- `font-heading` class → DM Sans (`--font-dm-sans`)
- `font-sans` default → DM Sans
- `font-mono` → JetBrains Mono

## Animations

Two animation systems coexist — use the appropriate one:

1. **Framer Motion** (for scroll-triggered and complex animations): variants are in `src/lib/animations.ts`. Wrap with `<motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>`.
2. **CSS keyframes** (for simple loops and entrance classes): `.anim-fade-up`, `.anim-fade-in`, `.anim-slide-left`, `.sticker-badge` wobble — all in `globals.css`.

## `next.config.ts`

`transpilePackages: ["three"]` is pre-configured for potential Three.js use. No other Next.js config overrides exist.

# Always be collaberative don't do anything major without asking me
