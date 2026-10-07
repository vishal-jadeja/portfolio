import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { adminClient } from "@/lib/supabase/admin";
import type { Media } from "./types";
export async function validateUpload(media: Media) {
  if (media.state === "ready" || media.state === "published") return;
  if (media.state !== "pending")
    throw new Error("Upload is no longer available. Upload the image again.");
  if (Date.now() - new Date(media.created_at).getTime() > 24 * 60 * 60 * 1000)
    throw new Error("Upload expired. Upload the image again.");
  const client = adminClient();
  const bucket = client.storage.from("blog-drafts");
  try {
    const { data, error } = await bucket.download(media.private_object_path);
    if (error || !data) throw new Error("Image upload did not complete.");
    if (data.size !== media.bytes || data.size > 5 * 1024 * 1024)
      throw new Error("Image size does not match upload reservation.");
    const input = Buffer.from(await data.arrayBuffer());
    const decoder = sharp(input, {
      limitInputPixels: 20_000_000,
      animated: false,
    });
    const metadata = await decoder.metadata();
    const formats: Record<string, string> = {
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
    };
    if (
      !metadata.format ||
      formats[metadata.format] !== media.mime_type ||
      (metadata.pages ?? 1) > 1
    )
      throw new Error("Upload a non-animated JPEG, PNG or WebP image.");
    const { data: output, info } = await decoder
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
    const { error: uploadError } = await bucket.upload(
      `${media.private_object_path}.webp`,
      output,
      { contentType: "image/webp", upsert: true },
    );
    if (uploadError) throw new Error("Unable to prepare this image.");
    const { error: updateError } = await client
      .from("blog_media")
      .update({
        state: "ready",
        width: info.width,
        height: info.height,
        checksum: createHash("sha256").update(output).digest("hex"),
        validated_at: new Date().toISOString(),
      })
      .eq("id", media.id)
      .eq("state", "pending");
    if (updateError) throw new Error("Unable to record image validation.");
  } catch (error) {
    await client
      .from("blog_media")
      .update({ state: "failed" })
      .eq("id", media.id)
      .eq("state", "pending");
    throw error;
  }
}
export async function promoteMedia(
  postId: string,
  ownerId: string,
  ids: string[],
) {
  if (!ids.length) return;
  const client = adminClient();
  const { data, error } = await client
    .from("blog_media")
    .select("*")
    .eq("post_id", postId)
    .eq("owner_id", ownerId)
    .in("id", ids);
  if (error || data?.length !== ids.length)
    throw new Error("An image does not belong to this draft.");
  for (const media of data as Media[]) {
    if (
      !["ready", "published"].includes(media.state) ||
      !media.checksum ||
      !media.alt_text.trim()
    )
      throw new Error("All images need validation and alt text.");
    if (media.public_object_path) continue;
    const path = `${postId}/${media.id}-${media.checksum}.webp`;
    const { data: file, error: downloadError } = await client.storage
      .from("blog-drafts")
      .download(`${media.private_object_path}.webp`);
    if (downloadError || !file)
      throw new Error("Unable to prepare article images.");
    const { error: uploadError } = await client.storage
      .from("blog-public")
      .upload(path, file, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    if (
      uploadError &&
      !["409", "Duplicate"].includes(String(uploadError.statusCode)) &&
      !/already exists/i.test(uploadError.message)
    )
      throw new Error("Image publication failed. Please retry.");
    const { error: updateError } = await client
      .from("blog_media")
      .update({ public_object_path: path })
      .eq("id", media.id);
    if (updateError) throw new Error("Unable to record published image.");
  }
}
