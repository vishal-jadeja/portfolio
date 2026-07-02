<div align="center">

# Vishal Jadeja — Portfolio

A single-page developer portfolio built with Next.js 16 and React 19, featuring a neobrutalist design system, Framer Motion animations, and a RAG-powered AI chatbot that answers visitor questions grounded in a real knowledge base.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-yellow)](#license)

<!-- PLACEHOLDER: hero screenshot -->
![Portfolio hero screenshot](https://placehold.co/1200x630/f5f5f5/111111?text=Hero+Screenshot)

</div>

---

## Overview

This repo powers [vishaljadeja.dev](https://vishaljadeja.dev) *(update with your live URL)* — a fast, animated, single-page portfolio with no backend framework, no CMS, and no dynamic routes. Content is authored as plain TypeScript objects and rendered by section components. The only "backend" is a lightweight RAG chat API that lets visitors ask questions about my background and get answers pulled from a real knowledge base instead of a canned FAQ.

## Features

- **Neobrutalist design system** — bordered cards, offset shadows, yellow accent, custom utility classes (`.brutal-card`, `.brutal-btn`, `.skill-tag`, etc.)
- **Light/dark theme** — class-based toggle persisted to `localStorage`, no `prefers-color-scheme` dependency
- **Scroll-triggered animations** — Framer Motion variants layered with CSS keyframe fallbacks
- **GitHub contributions heatmap** — live activity graph with light/dark support
- **RAG-powered chatbot** — Gemini embeddings + Pinecone vector search + streaming Gemini generation, grounded in `src/knowledge/*.mdx` (see [CHATBOT.md](./CHATBOT.md))
- **Fully typed content layer** — projects, experience, skills, and socials are structured data, not hardcoded JSX

<!-- PLACEHOLDER: light/dark mode comparison -->
<p align="center">
  <img src="https://placehold.co/600x375/f5f5f5/111111?text=Light+Mode" width="48%" alt="Light mode placeholder" />
  <img src="https://placehold.co/600x375/1a1a1a/FFE600?text=Dark+Mode" width="48%" alt="Dark mode placeholder" />
</p>

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router only, no `pages/`) |
| UI | React 19, Framer Motion, react-icons |
| Styling | Tailwind CSS v4 (`@theme inline` tokens, no `tailwind.config.*` for theme) |
| Language | TypeScript |
| AI / RAG | Google Gemini (embeddings + generation), Pinecone (vector store) |
| Data | Supabase, gray-matter (MDX frontmatter parsing) |
| Analytics | Vercel Analytics, Vercel Speed Insights |
| Fonts | Bebas Neue (headings), Space Grotesk (body), JetBrains Mono (code) |

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # renders all sections sequentially
│   ├── layout.tsx        # fonts, metadata, global providers
│   ├── globals.css        # all styling — neobrutalism utilities, theme tokens, keyframes
│   └── api/               # chat API route (RAG endpoint)
├── components/
│   ├── sections/          # hero, about, projects, experience, skills, contact...
│   ├── PortfolioChat/     # AI chat widget
│   └── ...                # cursor effects, nav, theme toggle, tilt cards
├── data/
│   ├── experience.ts      # work history
│   ├── projects.ts        # project cards
│   ├── skills.ts          # skill categories
│   └── socials.ts         # social links + email
├── knowledge/              # *.mdx source-of-truth for the chatbot
└── lib/
    └── animations.ts       # shared Framer Motion variants
```

## Getting Started

**Prerequisites:** Node.js 18.18+ and npm.

```bash
git clone <your-repo-url>
cd portfolio
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run bot:ingest` | Re-embed all `src/knowledge/*.mdx` files into Pinecone |
| `npm run bot:ingest:file <name>` | Re-embed a single knowledge file |

There is no test suite configured.

## Updating Content

All portfolio content is static TypeScript — no CMS, no rebuild-triggering webhooks needed beyond a redeploy.

| To change... | Edit |
|---|---|
| Work history | [`src/data/experience.ts`](./src/data/experience.ts) |
| Project cards | [`src/data/projects.ts`](./src/data/projects.ts) |
| Skills list | [`src/data/skills.ts`](./src/data/skills.ts) |
| Social links / email | [`src/data/socials.ts`](./src/data/socials.ts) |
| Chatbot knowledge | `src/knowledge/*.mdx`, then run `npm run bot:ingest` |

## AI Chatbot

The portfolio ships with a RAG chat widget that answers visitor questions using a real knowledge base rather than a static FAQ — see [CHATBOT.md](./CHATBOT.md) for architecture, environment variables, ingestion workflow, and security details.

<!-- PLACEHOLDER: chatbot widget screenshot -->
![Chatbot widget screenshot](https://placehold.co/500x600/f5f5f5/111111?text=Chatbot+Widget)

## Deployment

Deployed on [Vercel](https://vercel.com). Push to `main` and Vercel builds and deploys automatically. Environment variables required for the chatbot must be added under **Project Settings → Environment Variables** — see the table in [CHATBOT.md](./CHATBOT.md#environment-variables).

## License

MIT © Vishal Jadeja
