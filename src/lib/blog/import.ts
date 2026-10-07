import matter from "gray-matter";
import { draftSchema, slugify } from "./schemas";
import type { DraftFields } from "./types";
export function importMarkdown(source: string, filename: string): DraftFields {
  if (!filename.toLowerCase().endsWith(".md"))
    throw new Error("Choose a .md Markdown file.");
  if (new TextEncoder().encode(source).length > 500_000)
    throw new Error("Import exceeds 500KB.");
  // Explicitly reject executable frontmatter languages; gray-matter otherwise supports JS engines.
  if (/^---[^\r\n]*[^\s-][^\r\n]*[\r\n]/.test(source))
    throw new Error("Only YAML frontmatter is supported.");
  const parsed = matter(source, {
    language: "yaml",
    engines: {
      yaml: (value) => {
        return safeYaml(value);
      },
    },
  });
  const allowed = new Set([
    "title",
    "slug",
    "excerpt",
    "description",
    "tags",
    "seo_title",
    "seo_description",
  ]);
  for (const key of Object.keys(parsed.data))
    if (!allowed.has(key))
      throw new Error(`Unsupported frontmatter field: ${key}`);
  const title = parsed.data.title ?? filename.replace(/\.md$/i, "");
  return draftSchema.parse({
    title,
    slug: parsed.data.slug ?? slugify(String(title)),
    excerpt: parsed.data.excerpt ?? parsed.data.description ?? "",
    body_markdown: parsed.content,
    tags: parsed.data.tags ?? [],
    cover_media_id: null,
    seo_title: parsed.data.seo_title ?? null,
    seo_description: parsed.data.seo_description ?? null,
  });
}
import { load, JSON_SCHEMA } from "js-yaml";
function safeYaml(value: string) {
  const result = load(value, { schema: JSON_SCHEMA });
  if (result == null) return {};
  if (typeof result !== "object" || Array.isArray(result))
    throw new Error("Frontmatter must be a mapping.");
  return result;
}
