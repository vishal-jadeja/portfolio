import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
export function expireBlog(id: string, slug: string) {
  for (const tag of ["blog:posts", `blog:post:${id}`, `blog:slug:${slug}`])
    revalidateTag(tag, { expire: 0 });
  for (const path of [
    "/",
    "/blog",
    `/blog/${slug}`,
    `/blog/${slug}/opengraph-image`,
    `/blog/${slug}/twitter-image`,
    "/feed.xml",
    "/sitemap.xml",
  ])
    revalidatePath(path);
}
