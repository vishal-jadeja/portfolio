export interface Experience {
  role: string;
  company: string;
  period: string;
  type: string;
  description: string;
  achievements: string[];
  current: boolean;
}

export const experiences: Experience[] = [
  {
    role: "Software Developer",
    company: "Glitchover",
    period: "Feb 2025 - Present",
    type: "Full-time",
    description:
      "Architecting scalable backend systems, real-time infrastructure, and payment microservices for a B2C gaming platform. Core responsibilities span system design, microservice ownership, database performance, and cross-team engineering.",
    achievements: [
      "Architected event-driven real-time tournament system with 25+ Socket.io events delivering sub-100ms bracket, standings, and lobby updates to 1,500+ concurrent WebSocket subscribers across room-scoped channels — eliminating polling and cutting API load by 60%.",
      "Engineered extensible multi-gateway payment microservice using Factory + Strategy patterns across Razorpay, Cashfree, and Stripe — enabling new gateway onboarding with zero changes to existing production code and zero controller-level branching.",
      "Secured webhook ingestion pipeline with HMAC-SHA256 timing-safe comparison (crypto.timingSafeEqual) and idempotent order-status checks, eliminating replay attacks and duplicate wallet credits from payment gateway retry storms across 3 providers.",
      "Reduced MongoDB query latency by 45% by redesigning compound index strategy across transaction and payout collections and implementing financial snapshot denormalization capturing 12 immutable fields at transaction time for audit-compliant multi-currency payout accuracy.",
      "Engineered multi-step financial waterfall with floating-point integrity checksum (±0.02 tolerance) covering forex markup, GST tax splitting (CGST/SGST/IGST), promo codes, and platform fees — catching silent arithmetic drift across high-volume cross-currency payment flows.",
      "Implemented Strategy pattern dispatching 5 bracket-generation algorithms (single-elimination, double-elimination, round-robin, Swiss, Battle Royale) at runtime, with O(N) preliminary-round insertion for non-power-of-2 participant counts and Fisher-Yates O(N) shuffle for unbiased seeding.",
      "Engineered pessimistic cache-update strategy with recursive Immer tree-walker simultaneously patching 3 RTK Query cache layers after match results, eliminating redundant GET requests and maintaining bracket consistency client-side without a full refetch.",
      "Built zero-downtime database-driven feature flag system enabling ops-controlled payment gateway toggling and dynamic fee configuration without redeployment, combined with 4-tier RBAC and IP-level ban detection across all payment admin routes.",
      "Optimized payment confirmation latency by deferring non-critical conversion tracking (Meta Pixel, analytics) via setImmediate and parallelizing multi-collection MongoDB writes with Promise.all, decoupling user-visible response time from third-party API performance.",
      "Led PWA migration from CRA (React 16) to Vite (React 19), reducing build times by 80% and improving cold-start performance, unblocking faster release cycles for the engineering team.",
      "Architected a cost-first 3-provider LLM fallback chain (Gemini → Cerebras → Groq) for a real-time AI support bot — quota-aware provider skipping, per-provider JSON-repair retries, and graceful human-agent handoff on exhaustion, maintaining uninterrupted support coverage through provider outages.",
      "Built a vector search RAG pipeline on MongoDB Atlas ($vectorSearch) with 1,024-dimension L2-normalized embeddings and a 0.55 confidence gate — low-confidence queries auto-escalate to human agents, grounding all LLM responses and eliminating hallucinated support answers.",
    ],
    current: true,
  },
  {
    role: "Software Development Intern",
    company: "Glitchover",
    period: "Aug 2024 - Feb 2025",
    type: "Internship",
    description:
      "Built authentication infrastructure, real-time systems, and CI/CD pipelines across the core platform. Focused on security hardening, test coverage, and developer tooling.",
    achievements: [
      "Engineered unified authentication pipeline using Passport.js supporting 5 identity providers (Google, Discord, Apple, local×2) with dual user-type session deserialization, stateless JWT auth, and 4-tier RBAC controlling access across 50+ API endpoints.",
      "Designed 11-stage Express middleware pipeline — CORS, NoSQL injection prevention, XSS sanitization, two-tier rate limiting (100 req/min global, 10 req/s on auth/payment routes), and APM tracing — securing every request with defense-in-depth and early-exit rejection.",
      "Configured Bitbucket Pipelines CI/CD with dual Jest environments (dev/prod) and branch-gated manual approval for production deploys, cutting deployment time by 70% and reducing production regressions through automated integration testing.",
      "Developed real-time notification system using Socket.io with graceful degradation — unauthenticated connections receive guest role rather than disconnection, preserving real-time access for public tournament spectators without forcing auth.",
      "Engineered fault-tolerant multi-channel Discord notification pipeline using Promise.allSettled for concurrent channel dispatch with zero failure cascade, backed by auto-discovery command registry enabling O(1) slash command routing across dynamically loaded modules.",
    ],
    current: false,
  },
];  