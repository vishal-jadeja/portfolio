import type { Metadata } from "next";
/** Private deployments expose noindex consistently to all crawlers. */
export function isIndexableEnvironment() {
  return (
    process.env.SITE_NOINDEX !== "true" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")
  );
}
export function pageRobots(index = true, follow = true): Metadata["robots"] {
  const shouldIndex = index && isIndexableEnvironment();
  const shouldFollow = follow && isIndexableEnvironment();
  return {
    index: shouldIndex,
    follow: shouldFollow,
    googleBot: {
      index: shouldIndex,
      follow: shouldFollow,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}
