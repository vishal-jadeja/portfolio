import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, X_HANDLE, pageRobots } from "@/lib/seo";
import type { Publication, Summary, MediaView } from "./types";
export const BLOG_DESCRIPTION =
  "Notes on engineering, systems, and things I learn along the way.";
export const PAGE_SIZE = 12;
// Change when the card design changes, so shared images get a fresh URL.
const SOCIAL_CARD_VERSION = 4;
export function articleImageUrl(
  post: Pick<Summary, "slug" | "source_version">,
  kind: "opengraph-image" | "twitter-image" = "opengraph-image",
) {
  return `${SITE_URL}/blog/${post.slug}/${kind}?v=${post.source_version}&style=${SOCIAL_CARD_VERSION}`;
}
export type BlogSearch = { page?: string | string[]; tag?: string | string[] };
export function missingPageMetadata(title = "Page not found"): Metadata {
  return {
    title,
    robots: pageRobots(false, false),
    alternates: { canonical: null },
    openGraph: null,
    twitter: null,
  };
}
export function parseBlogSearch(search: BlogSearch) {
  const rawPage = search.page ?? "1";
  const validPage =
    typeof rawPage === "string" &&
    /^[1-9]\d*$/.test(rawPage) &&
    Number(rawPage) <= 10000;
  const validTag =
    search.tag === undefined ||
    (typeof search.tag === "string" && search.tag.trim().length <= 30);
  return {
    page: validPage ? Number(rawPage) : 1,
    tag:
      typeof search.tag === "string"
        ? search.tag.trim().slice(0, 30).toLowerCase()
        : "",
    valid: validPage && validTag,
  };
}
export function listingPath(page: number, tag = "") {
  const query = new URLSearchParams();
  if (page > 1) query.set("page", String(page));
  if (tag) query.set("tag", tag);
  return `/blog${query.size ? `?${query}` : ""}`;
}
export function listingMetadata(
  page: number,
  tag: string,
  indexable: boolean,
): Metadata {
  const path = listingPath(page, tag);
  const title = `${tag ? `Posts tagged “${tag}”` : "Blog"}${page > 1 ? ` — Page ${page}` : ""}`;
  const description = tag
    ? `Articles tagged ${tag} by ${SITE_NAME}.`
    : BLOG_DESCRIPTION;
  const image = `${SITE_URL}/blog/opengraph-image?style=${SOCIAL_CARD_VERSION}`;
  return {
    title,
    description,
    keywords: [],
    alternates: {
      canonical: `${SITE_URL}${path}`,
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    robots: pageRobots(indexable && !tag),
    openGraph: {
      title: `${title} · ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}${path}`,
      siteName: `${SITE_NAME} — Writing`,
      locale: "en_US",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Writing by ${SITE_NAME}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} · ${SITE_NAME}`,
      description,
      site: X_HANDLE,
      creator: X_HANDLE,
      images: [
        {
          url: `${SITE_URL}/blog/twitter-image?style=${SOCIAL_CARD_VERSION}`,
          alt: `Writing by ${SITE_NAME}`,
        },
      ],
    },
  };
}
export function articleMetadata(post: Publication): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const image = articleImageUrl(post);
  return {
    title: post.seo_title || post.title,
    description: post.seo_description || post.excerpt,
    keywords: post.tags,
    robots: pageRobots(),
    alternates: {
      canonical: url,
      types: { "application/rss+xml": `${SITE_URL}/feed.xml` },
    },
    authors: [{ name: post.author_name, url: SITE_URL }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      siteName: `${SITE_NAME} — Writing`,
      locale: "en_US",
      publishedTime: post.published_at,
      modifiedTime: post.modified_at,
      authors: [SITE_URL],
      tags: post.tags,
      images: [{
        url: image,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: post.title,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      site: X_HANDLE,
      creator: X_HANDLE,
      images: [{
        url: articleImageUrl(post, "twitter-image"),
        alt: post.title,
      }],
    },
  };
}
export function articleStructuredData(post: Publication, cover?: MediaView) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: post.title,
        description: post.excerpt,
        datePublished: post.published_at,
        dateModified: post.modified_at,
        inLanguage: "en-US",
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: post.author_name,
          url: SITE_URL,
        },
        publisher: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: post.author_name,
          url: SITE_URL,
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: {
          "@type": "Blog",
          "@id": `${SITE_URL}/blog#blog`,
          name: `${SITE_NAME} — Writing`,
          url: `${SITE_URL}/blog`,
        },
        image: {
          "@type": "ImageObject",
          url: cover?.url ?? articleImageUrl(post),
          width: cover?.width ?? 1200,
          height: cover?.height ?? 630,
          caption: cover?.caption ?? post.title,
        },
        keywords: post.tags.join(", "),
        url,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Blog",
            item: `${SITE_URL}/blog`,
          },
          { "@type": "ListItem", position: 3, name: post.title, item: url },
        ],
      },
    ],
  };
}
export function listingStructuredData(
  posts: Summary[],
  page: number,
  tag: string,
  total: number,
) {
  const url = `${SITE_URL}${listingPath(page, tag)}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": url,
    url,
    name: tag ? `Articles tagged ${tag}` : `${SITE_NAME} — Writing`,
    description: BLOG_DESCRIPTION,
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      url: `${SITE_URL}/blog`,
      name: `${SITE_NAME} — Writing`,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: total,
      itemListElement: posts.map((post, index) => ({
        "@type": "ListItem",
        position: (page - 1) * PAGE_SIZE + index + 1,
        name: post.title,
        url: `${SITE_URL}/blog/${post.slug}`,
      })),
    },
  };
}
