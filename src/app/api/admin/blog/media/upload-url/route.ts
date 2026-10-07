import { z } from "zod";
import { requireOwner } from "@/lib/blog/auth";
import { adminClient } from "@/lib/supabase/admin";
import { checkOrigin, privateJson } from "@/lib/blog/route";
import { readableError } from "@/lib/blog/schemas";
const schema = z
  .object({
    post_id: z.string().uuid(),
    bytes: z
      .number()
      .int()
      .min(1)
      .max(5 * 1024 * 1024),
    mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
    alt_text: z.string().trim().min(1).max(1000),
    caption: z.string().max(1000).nullable(),
  })
  .strict();
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { client } = await requireOwner();
    const input = schema.parse(await request.json());
    const { data, error } = await client
      .rpc("blog_reserve_media", {
        p_post: input.post_id,
        p_bytes: input.bytes,
        p_mime: input.mime_type,
        p_alt: input.alt_text,
        p_caption: input.caption,
      })
      .single();
    if (error) throw new Error(error.message);
    const { data: signed, error: signingError } = await adminClient()
      .storage.from("blog-drafts")
      .createSignedUploadUrl(data.private_object_path);
    if (signingError || !signed)
      throw new Error("Unable to authorize this upload.");
    return privateJson({
      id: data.id,
      path: data.private_object_path,
      token: signed.token,
    });
  } catch (error) {
    return privateJson({ error: readableError(error) }, 400);
  }
}
