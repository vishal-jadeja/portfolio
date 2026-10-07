import "server-only";
import { requireOwner } from "./auth";
import { adminClient } from "@/lib/supabase/admin";
import type { Draft, Media, MediaView } from "./types";
import { uuid } from "./schemas";
export async function getDraft(id: string) {
  uuid.parse(id);
  const { client, user } = await requireOwner(true);
  const { data, error } = await client
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .eq("author_id", user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as Draft | null;
}
export async function getDraftMedia(id: string) {
  const { client, user } = await requireOwner();
  const { data, error } = await client
    .from("blog_media")
    .select("*")
    .eq("post_id", id)
    .eq("owner_id", user.id)
    .in("state", ["ready", "published"])
    .order("created_at");
  if (error) throw new Error(error.message);
  const rows = data as Media[];
  const storage = adminClient().storage.from("blog-drafts");
  return Promise.all(
    rows.map(async (m) => {
      const { data: signed, error: signError } = await storage.createSignedUrl(
        `${m.private_object_path}.webp`,
        3600,
      );
      if (signError || !signed) throw new Error("Could not preview image.");
      return {
        id: m.id,
        url: signed.signedUrl,
        width: m.width!,
        height: m.height!,
        alt_text: m.alt_text,
        caption: m.caption,
      } satisfies MediaView;
    }),
  );
}
