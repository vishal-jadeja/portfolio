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
    title: "Mintmark",
    tagline: "Personal Branding & Knowledge Platform",
    description:
      "A passive-first personal branding platform that turns what you learn into platform-ready content for LinkedIn, X, and Medium — simultaneously. Features a unified activity heatmap across all learning sources, AI-powered content generation via BYOK, and a personal knowledge assistant scoped strictly to your own notes and posts.",
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
    github: "https://github.com/vishal-jadeja/mintmark",
    imageUrl: "/images/MintMark-EA.webp",
    status: "in-progress",
    live: "https://mintmark-vishal.vercel.app",
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