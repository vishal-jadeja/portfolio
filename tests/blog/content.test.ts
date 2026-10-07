import { describe, expect, it } from "vitest";
import { importMarkdown } from "../../src/lib/blog/import";
import { inspectMarkdown, safeJson, xml } from "../../src/lib/blog/markdown";
import { draftSchema, publishSchema } from "../../src/lib/blog/schemas";
const id = "11111111-1111-4111-8111-111111111111";
describe("content contracts", () => {
  it("imports portable Markdown and normalized metadata", () => {
    const draft = importMarkdown(
      "---\ntitle: My systems notes\ndescription: How it works\ntags: [Systems, systems]\n---\n\n## Start\nA paragraph.",
      "notes.md",
    );
    expect(draft.slug).toBe("my-systems-notes");
    expect(draft.tags).toEqual(["systems"]);
    expect(draft.body_markdown).toContain("## Start");
    expect(publishSchema.safeParse(draft).success).toBe(true);
  });
  it("rejects executable frontmatter and unsupported fields", () => {
    expect(() =>
      importMarkdown("---js\n({title: process.exit()})\n---\nBody", "x.md"),
    ).toThrow();
    expect(() =>
      importMarkdown(
        "---\ntitle: !!js/function function(){}\n---\nBody",
        "x.md",
      ),
    ).toThrow();
    expect(() =>
      importMarkdown("---\nunknown: value\n---\nBody", "x.md"),
    ).toThrow("Unsupported");
    expect(() => importMarkdown("# Article", "x.mdx")).toThrow(".md");
    expect(() => importMarkdown("😀".repeat(130000), "x.md")).toThrow("500KB");
  });
  it("makes heading anchors unique and extracts direct and reference images", () => {
    const result = inspectMarkdown(
      `## Same\n## Same\n![Diagram](media:${id})\n![Reference][figure]\n[figure]: media:${id}`,
    );
    expect(result.errors).toEqual([]);
    expect(result.mediaIds).toEqual([id]);
    expect(result.headings.map((h) => h.id)).toEqual(["same", "same-2"]);
  });
  it("blocks HTML, unsafe links, unresolved imports and missing alt text", () => {
    const result = inspectMarkdown(
      "<script>alert(1)</script>\n\n[bad](javascript:alert)\n![](./local.png)",
    );
    expect(result.errors.join(" ")).toContain("Raw HTML");
    expect(result.errors.join(" ")).toContain("Links must");
    expect(result.errors.join(" ")).toContain("Upload or map");
    expect(result.errors.join(" ")).toContain("alt text");
  });
  it("allows incomplete drafts but rejects incomplete publications", () => {
    const draft = {
      title: "",
      slug: "draft-x",
      excerpt: "",
      body_markdown: "",
      tags: [],
      cover_media_id: null,
      seo_title: null,
      seo_description: null,
    };
    expect(draftSchema.safeParse(draft).success).toBe(true);
    expect(publishSchema.safeParse(draft).success).toBe(false);
    expect(
      draftSchema.safeParse({ ...draft, body_markdown: "😀".repeat(130000) })
        .success,
    ).toBe(false);
  });
  it("escapes script termination and feed markup", () => {
    expect(
      safeJson({ title: '</script><script>alert("x")</script>' }),
    ).not.toContain("<");
    expect(JSON.parse(safeJson({ title: "<hello>" })).title).toBe("<hello>");
    expect(xml('A & B < "test"')).toBe("A &amp; B &lt; &quot;test&quot;");
  });
});
