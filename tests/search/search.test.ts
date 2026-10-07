import { describe, expect, it } from "vitest";
import { highlightRanges, matchSnippet, normalize, prefixDistance, prepare, search } from "../../src/lib/search/match";
import { projectAnchorId, staticSearchEntries } from "../../src/lib/search/static-entries";
import { blogSearchEntries } from "../../src/lib/search/blog-entries";
import { hashId } from "../../src/lib/search/hash";
import { projects } from "../../src/data/projects";

const posts = [
  { slug: "older-post", title: "Eliminating Race Conditions", excerpt: "Idempotent APIs and locking.", tags: ["backend", "mongodb"], published_at: "2025-01-28T00:00:00Z" },
  { slug: "websockets-at-scale", title: "Building Real-Time Systems with WebSockets", excerpt: "1500+ concurrent users.", tags: ["websockets", "backend"], published_at: "2025-03-12T00:00:00Z" },
];
const index = prepare([...staticSearchEntries(), ...blogSearchEntries(posts)]);
const titles = (q: string) => search(index, q).map((e) => e.title);

describe("search matching", () => {
  it("normalizes punctuation and accents", () => {
    expect(normalize("Next.js — Café")).toBe("next js cafe");
    expect(normalize("C++ / C#")).toBe("c++ c#");
  });
  it("measures typos against word prefixes", () => {
    expect(prefixDistance("websok", "websockets")).toBe(1);
    expect(prefixDistance("deplyx", "deplyx")).toBe(0);
  });
  it("returns nothing for an empty query", () => {
    expect(search(index, "   ")).toEqual([]);
  });
  it("ranks an exact title match first", () => {
    expect(titles("deplyx")[0]).toBe("Deplyx");
    expect(titles("dep")[0]).toBe("Deplyx");
  });
  it("finds blog posts by title, tag and typo", () => {
    expect(titles("websockets").slice(0, 2)).toEqual(["websockets", "Building Real-Time Systems with WebSockets"]);
    expect(titles("websokets")).toContain("Building Real-Time Systems with WebSockets");
    expect(titles("race condition")[0]).toBe("Eliminating Race Conditions");
  });
  it("keeps typo tolerance out of long descriptions", () => {
    expect(titles("genora")).toEqual(["Genora"]);
  });
  it("requires every query word to match", () => {
    expect(titles("genora fastapi")).toEqual(["Genora"]);
    expect(titles("genora zzzz")).toEqual([]);
  });
  it("matches dotted tech names typed without punctuation", () => {
    expect(titles("nextjs").length).toBeGreaterThan(0);
  });
  it("doesn't let one letter prefix-match descriptions", () => {
    const hits = search(index, "g");
    expect(hits.length).toBeGreaterThan(0);
    for (const e of hits)
      expect(normalize(`${e.title} ${e.keywords?.join(" ") ?? ""}`).split(" ").some((w) => w.startsWith("g"))).toBe(true);
  });
  it("finds work history and skills", () => {
    expect(titles("glitchover")[0]).toMatch(/Glitchover/);
    expect(search(index, "redux").some((e) => e.kind === "skill")).toBe(true);
  });
});

describe("match highlighting", () => {
  const marked = (text: string, q: string) =>
    highlightRanges(text, q).map(([a, b]) => text.slice(a, b));
  it("marks word prefixes for every query token", () => {
    expect(marked("Building Real-Time Systems with WebSockets", "real web")).toEqual(["Real", "Web"]);
  });
  it("marks mid-word hits only for 3+ letter tokens", () => {
    expect(marked("TypeScript", "script")).toEqual(["Script"]);
    expect(marked("TypeScript", "pe")).toEqual([]);
  });
  it("keeps offsets right around accents and punctuation", () => {
    expect(marked("Café — Next.js", "cafe next")).toEqual(["Café", "Next"]);
  });
  it("prefers the longest token within a word", () => {
    expect(marked("Deplyx", "d deply")).toEqual(["Deply"]);
  });
  it("excerpts around the first match on a word boundary", () => {
    const text = "Architected an event-driven real-time tournament system with sub-100ms updates for spectators";
    expect(matchSnippet(text, "tournament", 12, 12)).toBe("…real-time tournament system with…");
    expect(matchSnippet(text, "tournament", 12, 10)).toBe("…real-time tournament system…");
    expect(matchSnippet("Short text", "short")).toBe("Short text");
    expect(matchSnippet("Short text", "zzz")).toBeNull();
  });
  it("marks nothing for an empty query", () => {
    expect(highlightRanges("Deplyx", "  ")).toEqual([]);
  });
});

describe("search index", () => {
  it("has unique ids and only internal or external hrefs", () => {
    const entries = [...staticSearchEntries(), ...blogSearchEntries(posts)];
    expect(new Set(entries.map((e) => e.id)).size).toBe(entries.length);
    for (const e of entries)
      expect(e.external ? /^(https:|mailto:)/.test(e.href) : e.href.startsWith("/")).toBe(true);
  });
  it("deep links every project to a unique card anchor", () => {
    const anchors = projects.map((p) => projectAnchorId(p.title));
    expect(new Set(anchors).size).toBe(projects.length);
    expect(anchors).toContain("project-amazon-clone");
    const deplyx = staticSearchEntries().find((e) => e.title === "Deplyx");
    expect(deplyx?.href).toBe("/#project-deplyx");
  });
  it("orders articles newest first and links tags to the filtered listing", () => {
    const entries = blogSearchEntries(posts);
    expect(entries.filter((e) => e.kind === "article").map((e) => e.href)).toEqual([
      "/blog/websockets-at-scale",
      "/blog/older-post",
    ]);
    const topics = entries.filter((e) => e.kind === "topic");
    expect(topics[0]).toMatchObject({ title: "backend", subtitle: "2 articles", href: "/blog?tag=backend" });
    expect(blogSearchEntries([{ ...posts[0], tags: ["c++ & go"] }]).at(-1)?.href).toBe("/blog?tag=c%2B%2B+%26+go");
  });
  it("sends Home to #top so it always scrolls to the top", () => {
    expect(staticSearchEntries().find((e) => e.id === "page:home")?.href).toBe("/#top");
  });
  it("decodes hashes without throwing on malformed escapes", () => {
    expect(hashId("#project-deplyx")).toBe("project-deplyx");
    expect(hashId("#caf%C3%A9")).toBe("café");
    expect(hashId("#%")).toBe("%");
    expect(hashId("#%E0%A4%A")).toBe("%E0%A4%A");
  });
  it("never exposes article bodies", () => {
    const withBody = { ...posts[0], body_markdown: "SECRET draft text" };
    expect(JSON.stringify(blogSearchEntries([withBody]))).not.toContain("SECRET");
  });
});
