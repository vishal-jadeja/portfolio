import "server-only";
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new Set([new URL(request.url).origin]);
  const canonical = process.env.NEXT_PUBLIC_SITE_URL;
  if (canonical) allowed.add(new URL(canonical).origin);
  if (process.env.VERCEL_URL) allowed.add(`https://${process.env.VERCEL_URL}`);
  // Next.js may normalize a local bind address to localhost internally.
  if (process.env.NODE_ENV === "development") {
    const host = request.headers.get("host");
    if (host && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host))
      allowed.add(`http://${host}`);
  }
  if (!origin || !allowed.has(origin))
    throw new Error("Invalid request origin.");
}
export function privateJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
