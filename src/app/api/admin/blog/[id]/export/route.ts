import { getDraft, getDraftMedia } from "@/lib/blog/admin";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) return new Response("Not found", { status: 404 });
  const assets = await getDraftMedia(id);
  return Response.json(
    {
      format: "portfolio-blog-export-v1",
      exported_at: new Date().toISOString(),
      draft,
      assets,
      note: "Asset URLs expire in one hour. Download each image separately and store with this manifest.",
    },
    {
      headers: {
        "Content-Disposition": `attachment; filename="${draft.slug}-backup.json"`,
        "Cache-Control": "private, no-store",
      },
    },
  );
}
