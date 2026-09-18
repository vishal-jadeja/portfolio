# Portfolio Chatbot

A RAG-powered chat widget that lets visitors ask questions about me and get accurate, real-time answers grounded in my knowledge base.

---

## Architecture

```
Browser
  └── PortfolioChat widget (src/components/PortfolioChat/)
        └── POST /api/chat  (src/app/api/chat/route.ts)
              ├── Rate limit (12 req/min per IP)
              ├── embedText(user query)  ──► Google AI  gemini-embedding-001
              ├── queryChunks(embedding) ──► Pinecone   vector similarity search
              ├── buildSystemPrompt(chunks)
              └── generateContentStream  ──► Google AI  gemini-2.0-flash
                    └── plain-text stream back to browser

Ingestion (one-time / on update)
  npm run bot:ingest
    └── src/knowledge/*.mdx
          ├── gray-matter frontmatter parse
          ├── chunk by H2 + paragraph
          ├── embedBatch()  ──► Google AI  gemini-embedding-001  (768-dim, truncated)
          └── upsertChunks() ──► Pinecone  index: portfolio-bot
```

**Key design choices:**
- Chat history is persisted in `localStorage` only — no server-side sessions
- IP addresses are SHA-256 hashed before logging — raw IPs never touch disk
- All secrets stay server-side; the client bundle contains zero credentials

---

## Setup

1. **Clone and install**
   ```bash
   git clone <your-repo>
   cd Portfolio
   npm install
   ```

2. **Create a Google AI Studio API key**  
   Go to [aistudio.google.com](https://aistudio.google.com) → API keys → Create API key.

3. **Create a Pinecone account and index**  
   - Sign up at [app.pinecone.io](https://app.pinecone.io)
   - Create a new index: name `portfolio-bot`, dimensions `768`, metric `cosine`
   - Copy the API key from the dashboard

4. **Copy the environment template**
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in all values (see table below).

5. **Ingest your knowledge base**
   ```bash
   npm run bot:ingest
   ```
   This embeds every `.mdx` file in `src/knowledge/` into Pinecone.

6. **Run the dev server**
   ```bash
   npm run dev
   ```
   Open [localhost:3000](http://localhost:3000) — the chat button appears bottom-right.

---

## Adding Knowledge

The bot only knows what's in `src/knowledge/`. To add or update content:

1. Edit or create a `.mdx` file in `src/knowledge/`
2. Include YAML frontmatter:
   ```yaml
   ---
   category: projects   # used for metadata filtering
   tags: [react, typescript]
   ---
   ```
3. Write content using Markdown headings. Each `##` section becomes a separate chunk.
4. Re-run ingestion:
   ```bash
   npm run bot:ingest
   # or for a single file:
   npm run bot:ingest:file about.mdx
   ```

---

## Environment Variables

| Variable | Required | Description | Where to get |
|---|---|---|---|
| `GOOGLE_API_KEY` | ✅ | Google Gemini API key (embedding + generation) | [aistudio.google.com](https://aistudio.google.com) → API keys |
| `PINECONE_API_KEY` | ✅ | Pinecone vector database API key | [app.pinecone.io](https://app.pinecone.io) → API keys |
| `PINECONE_INDEX_NAME` | ✅ | Name of your Pinecone index | Set when creating the index; default `portfolio-bot` |
| `BOT_OWNER_NAME` | ✅ | Your full name (shown in chat header + system prompt) | Set to your name, e.g. `Vishal Jadeja` |
| `BOT_OWNER_HANDLE` | ✅ | Your handle/username (used in system prompt personality) | e.g. `vishal-jadeja` |
| `RATE_LIMIT_RPM` | ❌ | Max requests per minute per IP (default: `12`) | Set lower in production if concerned about abuse |
| `NODE_ENV` | ❌ | Runtime environment (default: `development`) | Automatically set by Next.js / Vercel |

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. In **Settings → Environment Variables**, add every variable from the table above.  
   Do **not** commit `.env.local` — it is git-ignored.
4. Deploy. The Vercel cron in `vercel.json` will ping `/api/health` every 10 minutes to keep the function warm.

> **Note:** Vercel's free Hobby plan supports cron jobs with a minimum interval of 1 hour on free, and 1 minute on Pro. The current config uses `*/10 * * * *` — adjust to `0 * * * *` if you're on the free plan.

---

## Security Measures

| Measure | Implementation |
|---|---|
| API keys never reach the browser | All Gemini and Pinecone calls are server-side only (`route.ts`) |
| Rate limiting | 12 req/min per IP, enforced in `src/lib/security/rate-limiter.ts` |
| Input validation | Zod schema validates message structure and length (`input-validator.ts`) |
| Prompt injection protection | Regex patterns strip common injection phrases before embedding |
| IP anonymisation | SHA-256 hash of IP stored in logs, never the raw address |
| Security headers | `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy` on all routes (Next.js config + per-response) |
| Content-Security-Policy | `connect-src 'self'` and strict `default-src` in `src/lib/security/headers.ts` |
| No session storage | Chat history is client-side `localStorage` only — no server-side state |

---

## Cost Breakdown

Targeting $0/month on free tiers:

| Service | Free tier | Projected usage |
|---|---|---|
| **Google AI Studio** | 1,500 req/day (Gemini 2.0 Flash), 1,500 req/day (embedding) | ~10–50 chat sessions/day → well within limits |
| **Pinecone** | 1 index, 100k vectors, 1M reads/month (Starter) | 32 vectors ingested; queries are tiny |
| **Vercel** | 100 GB bandwidth, 100k function invocations/month (Hobby) | Portfolio traffic typically < 10k req/month |

**Total: $0/month** unless traffic exceeds ~3,000 chat messages/day.

---

## Updating the Bot's Personality

The bot's tone, constraints, and persona are defined in:

```
src/lib/rag/prompt-builder.ts
```

Edit the `buildSystemPrompt()` function to change:
- **Tone** — currently "witty, warm, direct"
- **Response length** — currently capped at 3 sentences for simple questions
- **Topics to avoid** — jailbreak deflection is defined here
- **Projects to mention** — `Cadenz` is referenced as a notable project
- **Owner context** — uses `BOT_OWNER_NAME` and `BOT_OWNER_HANDLE` from env

After editing `prompt-builder.ts`, the change takes effect immediately on the next request — no re-ingestion needed.
