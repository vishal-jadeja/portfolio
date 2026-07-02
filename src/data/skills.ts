export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    icon: "⚡",
    skills: ["JavaScript", "TypeScript", "Python", "C++", "C"],
  },
  {
    title: "Frontend",
    icon: "🎨",
    skills: [
      "React.js",
      "Next.js",
      "Redux Toolkit",
      "RTK Query",
      "TanStack Query",
      "Vite",
      "PWA",
    ],
  },
  {
    title: "Backend",
    icon: "⚙️",
    skills: [
      "Node.js",
      "Express.js",
      "REST APIs",
      "WebSockets",
      "JWT",
      "Passport.js",
      "OAuth 2.0",
    ],
  },
  {
    title: "AI / ML",
    icon: "🤖",
    skills: [
      "LLM API Integration (Gemini, Cerebras, Groq)",
      "RAG Pipelines",
      "Vector Search (MongoDB Atlas $vectorSearch)",
      "LLM Fallback / Resilience Architecture",
      "Prompt Engineering",
    ],
  },
  {
    title: "Databases",
    icon: "🗄️",
    skills: [
      "MongoDB",
      "Indexing & Aggregation",
      "Query Optimization",
      "MySQL",
      "SQL Server",
    ],
  },
  {
    title: "Architecture",
    icon: "🏗️",
    skills: [
      "Microservices",
      "Event-Driven Systems",
      "MVC",
      "Factory Pattern",
      "Concurrency",
      "ACID Transactions",
      "Rate Limiting",
      "Idempotent APIs",
    ],
  },
  {
    title: "DevOps & Tools",
    icon: "🚀",
    skills: ["Git", "Bitbucket CI/CD", "Jest", "Agile / Scrum"],
  },
];
