import { notFound, permanentRedirect } from "next/navigation";
import { listingPath, parseBlogSearch, type BlogSearch } from "@/lib/blog/metadata";

export default async function BlogsAlias({ searchParams }: { searchParams: Promise<BlogSearch> }) {
  const { page, tag, valid } = parseBlogSearch(await searchParams);
  if (!valid) notFound();
  permanentRedirect(listingPath(page, tag));
}
