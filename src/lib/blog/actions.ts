"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireOwner } from "./auth";
import { draftSchema, publishSchema, readableError, uuid } from "./schemas";
import { inspectMarkdown } from "./markdown";
import { promoteMedia } from "./media";
import { adminClient } from "@/lib/supabase/admin";
import { sessionClient } from "@/lib/supabase/server";
import { expireBlog } from "./cache";
import { PERSON } from "@/lib/seo";
import type { ActionResult, Draft, DraftFields } from "./types";

export async function createDraftAction() {
  const { client } = await requireOwner();
  const { data, error } = await client.rpc("blog_create_draft").single();
  if (error) throw new Error(error.message);
  redirect(`/admin/blog/${data.id}/edit`);
}
export async function saveDraftAction(
  id: string,
  version: number,
  fields: DraftFields,
): Promise<ActionResult<Draft>> {
  try {
    uuid.parse(id);
    const validated = draftSchema.parse(fields);
    const { client } = await requireOwner();
    const { data, error } = await client
      .rpc("blog_save_draft", {
        p_id: id,
        p_version: version,
        p_fields: validated,
      })
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, data: data as Draft };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}
export async function publishPostAction(
  id: string,
  version: number,
): Promise<ActionResult<{ slug: string }>> {
  try {
    uuid.parse(id);
    const { client, user } = await requireOwner();
    const { data, error } = await client
      .from("blog_posts")
      .select("*")
      .eq("id", id)
      .eq("author_id", user.id)
      .single();
    if (error) throw new Error("Draft not found.");
    const draft = data as Draft;
    if (draft.version !== version)
      throw new Error("Conflict: reload this draft before publishing.");
    publishSchema.parse(
      Object.fromEntries(
        Object.keys(draftSchema.shape).map((key) => [
          key,
          draft[key as keyof Draft],
        ]),
      ),
    );
    const markdown = inspectMarkdown(draft.body_markdown);
    if (markdown.errors.length) throw new Error(markdown.errors.join(" "));
    const ids = [
      ...new Set([
        ...markdown.mediaIds,
        ...(draft.cover_media_id ? [draft.cover_media_id] : []),
      ]),
    ];
    if (ids.length > 50) throw new Error("Maximum 50 images per article.");
    await promoteMedia(id, user.id, ids);
    const { error: publishError } = await adminClient().rpc("blog_publish", {
      p_id: id,
      p_actor: user.id,
      p_version: version,
      p_media_ids: ids,
      p_reading: markdown.readingMinutes,
      p_author: PERSON.name,
    });
    if (publishError) throw new Error(publishError.message);
    try {
      expireBlog(id, draft.slug);
    } catch {
      return {
        ok: true,
        data: { slug: draft.slug },
        warning:
          "Published; public cache refresh is pending. Use Refresh public pages to retry.",
      };
    }
    return { ok: true, data: { slug: draft.slug } };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}
export async function setPostStateAction(
  id: string,
  state: "unpublish" | "archive" | "restore",
): Promise<ActionResult<null>> {
  try {
    uuid.parse(id);
    const { client } = await requireOwner();
    const { data: slug, error } = await client.rpc("blog_set_state", {
      p_id: id,
      p_state: state,
    });
    if (error) throw new Error(error.message);
    try {
      expireBlog(id, slug);
      revalidatePath("/admin/blog");
    } catch {
      return {
        ok: true,
        data: null,
        warning:
          "Saved; public cache refresh is pending. Retry Refresh public pages.",
      };
    }
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}
export async function refreshPublicAction(
  id: string,
): Promise<ActionResult<null>> {
  try {
    uuid.parse(id);
    const { client } = await requireOwner();
    const { data, error } = await client
      .from("blog_posts")
      .select("slug")
      .eq("id", id)
      .single();
    if (error) throw new Error("Draft not found.");
    expireBlog(id, data.slug);
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: readableError(error) };
  }
}
export async function loginAction(
  _previous: { message: string },
  form: FormData,
) {
  const email = String(form.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    return { message: "Enter a valid email address." };
  const h = await headers();
  const origin = h.get("origin");
  const allowed =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.vishaljadeja.xyz";
  const redirectOrigin =
    process.env.NODE_ENV === "development" &&
    origin?.startsWith("http://localhost:")
      ? origin
      : allowed;
  const client = await sessionClient();
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${redirectOrigin}/auth/callback`,
    },
  });
  return {
    message: error
      ? "Unable to send a sign-in link. Check the email and try again shortly."
      : "Check your email for a sign-in link.",
  };
}
export async function signOutAction() {
  const client = await sessionClient();
  await client.auth.signOut();
  redirect("/admin/login");
}
