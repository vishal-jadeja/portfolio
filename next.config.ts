import type { NextConfig } from "next";
import { isIndexableEnvironment } from "./src/lib/search-indexing";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const blogImagePatterns = supabaseUrl
  ? [
      {
        protocol: new URL(supabaseUrl).protocol.replace(":", "") as
          "https" | "http",
        hostname: new URL(supabaseUrl).hostname,
        pathname: "/storage/v1/object/public/blog-public/**",
      },
    ]
  : [];
const nextConfig: NextConfig = {
  distDir: process.env.BLOG_TEST_BUILD_DIR ?? ".next",
  transpilePackages: ["three"],
  // Keep canonical and indexing directives in the initial head for every crawler.
  htmlLimitedBots: /.*/,
  images: {
    dangerouslyAllowLocalIP: Boolean(process.env.BLOG_TEST_BUILD_DIR),
    remotePatterns: [
      ...blogImagePatterns,
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "github.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    return [
      ...(!isIndexableEnvironment()
        ? [
            {
              source: "/:path*",
              headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
            },
          ]
        : []),
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
