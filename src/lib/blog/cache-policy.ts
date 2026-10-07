// Publishing expires the public caches immediately. This request-driven
// fallback is recovery for a missed invalidation, not a publishing delay.
export const BLOG_REVALIDATE_SECONDS = 86400;
