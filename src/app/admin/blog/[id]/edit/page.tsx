import { notFound } from "next/navigation";
import PostEditor from "@/components/admin/blog/PostEditor";
import { getDraft, getDraftMedia } from "@/lib/blog/admin";
import { requireOwner } from "@/lib/blog/auth";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) notFound();
  const { client } = await requireOwner();
  const [{ data: publication, error }, media] = await Promise.all([
    client
      .from("blog_publications")
      .select("source_version")
      .eq("post_id", id)
      .maybeSingle(),
    getDraftMedia(id),
  ]);
  if (error) throw new Error("Could not load publication state.");
  return (
    <PostEditor
      initial={draft}
      initialMedia={media}
      publishedVersion={publication?.source_version ?? null}
    />
  );
}
