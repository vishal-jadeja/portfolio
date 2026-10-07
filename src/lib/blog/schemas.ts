import { z } from "zod";
export const uuid = z.string().uuid();
export const draftSchema = z
  .object({
    title: z.string().max(160),
    slug: z
      .string()
      .max(120)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use lowercase letters, numbers and single hyphens.",
      ),
    excerpt: z.string().max(300),
    body_markdown: z
      .string()
      .refine(
        (v) => new TextEncoder().encode(v).length <= 500_000,
        "Article exceeds 500KB.",
      ),
    tags: z
      .array(z.string().trim().min(1).max(30))
      .max(5)
      .transform((tags) => [...new Set(tags.map((t) => t.toLowerCase()))]),
    cover_media_id: uuid.nullable(),
    seo_title: z.string().max(160).nullable(),
    seo_description: z.string().max(300).nullable(),
  })
  .strict();
export const publishSchema = draftSchema
  .refine((v) => v.title.trim().length > 0, "Add a title.")
  .refine((v) => v.excerpt.trim().length > 0, "Add a description.")
  .refine((v) => v.slug.length >= 3, "Slug needs at least three characters.")
  .refine((v) => v.body_markdown.trim().length > 0, "Add article content.");
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}
export function readableError(error: unknown) {
  if (error instanceof z.ZodError)
    return error.issues
      .map((i) => `${i.path.join(".") || "Article"}: ${i.message}`)
      .join(" ");
  return error instanceof Error
    ? error.message
    : "Something went wrong. Please retry.";
}
