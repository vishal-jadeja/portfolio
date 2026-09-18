export interface Project {
  title: string;
  tagline: string;
  description: string;
  techStack: string[];
  highlights: string[];
  github: string;
  live?: string;
  imageUrl?: string;
  status?: "in-progress" | "completed";
}

export const projects: Project[] = [
  {
    title: "Cadenz",
    tagline: "An AI Layer On Your Intellectual Life",
    description:
      "A passive-first platform that tracks everything you read, build, and write, then makes it queryable. A unified activity heatmap pulls GitHub, LeetCode, notes, and sessions into one grid; a RAG knowledge assistant answers questions strictly from your own notes with full tenant isolation; and a publishing layer turns any of it into posts for LinkedIn, X, and Medium.",
    techStack: [
      "Next.js 16",
      "TypeScript",
      "React 19",
      "Supabase",
      "TanStack Query",
      "Zustand",
      "Tailwind CSS v4",
      "Trigger.dev",
      "Upstash Redis",
    ],
    highlights: [
      "BYOK AI layer supporting Claude, GPT, Gemini, and Groq",
      "Unified heatmap aggregating GitHub, LeetCode, notes, and sessions",
      "Per-platform AI instructions with simultaneous content generation",
      "RAG-powered personal knowledge assistant with strict tenant isolation",
      "Early access waitlist with referral queue mechanics",
    ],
    github: "https://github.com/vishal-jadeja/Cadenz",
    imageUrl: "/images/cadenz.webp",
    status: "in-progress",
    live: "https://mintmark-vishal.vercel.app",
  },
  {
    title: "Genora",
    tagline: "Write Once. Repurpose Everywhere.",
    description:
      "A multi-agent content pipeline that turns one raw thought into platform-native posts without the AI tells. Every draft passes through a writer → critic → reviser loop per platform, gated by Slop Guard — a quality check that rejects low-effort input before a single token is spent. Built as a Next.js frontend over a Python/FastAPI AI core, orchestrated end-to-end with Trigger.dev.",
    techStack: [
      "Next.js 16",
      "TypeScript",
      "Python 3.12",
      "FastAPI",
      "Trigger.dev v4",
      "Neon Postgres",
      "pgvector",
      "Upstash Redis",
      "NextAuth v5",
      "Gemini Embeddings",
    ],
    highlights: [
      "Slop Guard: input quality gate that rejects low-signal prompts pre-generation",
      "Per-platform writer → critic → reviser loop to strip AI-generated artifacts",
      "Trigger.dev v4 orchestration with graceful degradation — one platform failing never kills the job",
      "RAG personalization over pgvector so output keeps the author's voice",
      "BYOK across Anthropic, OpenAI, Gemini, and Groq, plus a free-tier model path",
      "Versioned generations with per-user usage tracking and Redis-backed quotas",
    ],
    github: "https://github.com/vishal-jadeja/Genora",
    live: "https://genora-vishal.vercel.app",
    status: "completed",
  },
  {
    title: "Peerly",
    tagline: "Find Real People to Learn From",
    description:
      "Describe a learning goal in plain English. Peerly searches Reddit, X, and LinkedIn for people who recently posted about it, then uses Groq AI to draft a personalized outreach message for each one — combining async multi-platform scraping with LLM-generated queries and copy-ready messages.",
    techStack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "FastAPI",
      "Python",
      "Groq",
      "LLaMA 3.3-70b",
      "PostgreSQL",
      "Prisma 7",
      "NextAuth v5",
    ],
    highlights: [
      "Plain-English goal → AI-generated platform-specific queries",
      "Parallel scraping across Reddit, X, and LinkedIn via asyncio.gather",
      "Groq + LLaMA 3.3-70b drafts personalized outreach per person",
      "OAuth login via Google and GitHub (NextAuth v5)",
      "FastAPI scraper service proxied through Next.js API routes",
    ],
    github: "https://github.com/vishal-jadeja/peerly",
    imageUrl: "/images/peerly.webp",
    status: "completed",
  },
  {
    title: "Cinova",
    tagline: "Goal-Focused New Tab Dashboard",
    description:
      "A Chrome extension that transforms your new tab into a productivity command center. Tracks weekly, monthly, and yearly goals with inline completion and notes, includes a Pomodoro timer with browser notifications, Focus Mode for domain-level site blocking, and a Rewards Mode that unlocks when goal thresholds are met.",
    techStack: [
      "React 19",
      "TypeScript",
      "Vite",
      "Chrome Manifest V3",
      "Chrome Storage API",
    ],
    highlights: [
      "Weekly/monthly/yearly goal tracking with inline notes and links",
      "Pomodoro timer with customizable work/break sessions and notifications",
      "Focus Mode: domain-level site blocking with goal-reminder block page",
      "Rewards Mode: completion-threshold unlocking",
      "Auto-rotating curated landscape backgrounds + custom image uploads",
    ],
    github: "https://github.com/vishal-jadeja/cinova",
    imageUrl: "/images/cinova.webp",
    status: "in-progress",
  },
  {
    title: "Syncify",
    tagline: "YouTube → Spotify Playlist Converter",
    description:
      "A seamless tool that converts YouTube playlists to Spotify using intelligent fuzzy matching. Handles OAuth 2.0 flows for both platforms, gracefully manages API rate limits, and reduced manual playlist migration effort by 95%.",
    techStack: [
      "React.js",
      "Node.js",
      "OAuth 2.0",
      "YouTube API",
      "Spotify API",
      "Fuzzy Matching",
    ],
    highlights: [
      "OAuth 2.0 dual-platform auth",
      "Fuzzy matching algorithm for song accuracy",
      "Intelligent rate limit handling",
      "95% reduction in manual effort",
    ],
    github: "https://github.com/vishal-jadeja/syncify",
    imageUrl: "/images/syncify-image.webp",
    live: "https://syncify-vishal.netlify.app",
  },
  {
    title: "Amazon Clone",
    tagline: "E-Commerce Web Application",
    description:
      "User-side e-commerce platform replicating Amazon's core features — JWT authentication, product catalog, shopping cart, and order processing. Built with a mobile-first responsive UI using React.js and Redux, backed by scalable MongoDB schemas with efficient indexing.",
    techStack: [
      "React.js",
      "Redux",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JWT",
    ],
    highlights: [
      "JWT authentication system",
      "Product catalog with cart & orders",
      "Mobile-first responsive UI",
      "Scalable MongoDB schema design",
    ],
    github: "https://github.com/vishal-jadeja/AmazonClone",
    imageUrl: "/images/amazon-clone.webp",
  },
  // {
  //   title: "Movie Recommendation System",
  //   tagline: "Content-Based Film Discovery Engine",
  //   description:
  //     "A content-based movie recommender that finds similar films using cosine similarity on TF-IDF vectorized metadata — genres, keywords, cast, and crew. Built as an interactive Streamlit app where you pick a movie and instantly get five tailored recommendations.",
  //   techStack: [
  //     "Python",
  //     "Streamlit",
  //     "Scikit-learn",
  //     "Pandas",
  //     "TMDB API",
  //     "Cosine Similarity",
  //     "TF-IDF",
  //   ],
  //   highlights: [
  //     "Cosine similarity on TF-IDF vectorized movie metadata",
  //     "Combines genres, keywords, cast, and crew as features",
  //     "Real-time poster fetching via TMDB API",
  //     "Interactive Streamlit UI with instant recommendations",
  //   ],
  //   github: "https://github.com/vishal-jadeja/Movie-Recommendation-System",
  // },
];