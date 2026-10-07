import { requireOwner } from "@/lib/blog/auth";
import { validateUpload } from "@/lib/blog/media";
import { getDraftMedia } from "@/lib/blog/admin";
import { checkOrigin, privateJson } from "@/lib/blog/route";
import { readableError, uuid } from "@/lib/blog/schemas";
import type { Media } from "@/lib/blog/types";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { client, user } = await requireOwner();
    const id = uuid.parse((await request.json()).id);
    const { data, error } = await client
      .from("blog_media")
      .select("*")
      .eq("id", id)
      .eq("owner_id", user.id)
      .single();
    if (error) throw new Error("Upload reservation not found.");
    await validateUpload(data as Media);
    const media = (await getDraftMedia(data.post_id)).find((m) => m.id === id);
    return privateJson({ media });
  } catch (error) {
    return privateJson({ error: readableError(error) }, 400);
  }
}
