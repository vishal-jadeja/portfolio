export type Media = {
  id: string;
  post_id: string;
  owner_id: string;
  private_object_path: string;
  public_object_path: string | null;
  mime_type: string;
  bytes: number;
  width: number | null;
  height: number | null;
  checksum: string | null;
  alt_text: string;
  caption: string | null;
  state: "pending" | "ready" | "published" | "failed";
  created_at: string;
  validated_at: string | null;
};
export type DraftFields = {
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  tags: string[];
  cover_media_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
};
export type Draft = DraftFields & {
  id: string;
  author_id: string;
  version: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  first_published_at: string | null;
};
export type Publication = DraftFields & {
  post_id: string;
  author_name: string;
  published_at: string;
  modified_at: string;
  source_version: number;
  reading_minutes: number;
};
export type Summary = Omit<Publication, "body_markdown">;
export type MediaView = {
  id: string;
  url: string;
  width: number;
  height: number;
  alt_text: string;
  caption: string | null;
};
export type ActionResult<T> =
  { ok: true; data: T; warning?: string } | { ok: false; error: string };
