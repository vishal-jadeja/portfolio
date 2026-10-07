import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { checkOrigin } from "../../src/lib/blog/route";
afterEach(() => {
  vi.unstubAllEnvs();
});
describe("cookie mutation origin checks", () => {
  it("accepts the canonical app origin behind an internal proxy URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.vishaljadeja.xyz");
    expect(() =>
      checkOrigin(
        new Request("http://localhost:3000/api/admin/blog/media", {
          headers: { origin: "https://www.vishaljadeja.xyz" },
        }),
      ),
    ).not.toThrow();
  });
  it("rejects missing and unrelated origins", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://www.vishaljadeja.xyz");
    expect(() =>
      checkOrigin(
        new Request("https://www.vishaljadeja.xyz/api/admin/blog/media"),
      ),
    ).toThrow("origin");
    expect(() =>
      checkOrigin(
        new Request("https://www.vishaljadeja.xyz/api/admin/blog/media", {
          headers: { origin: "https://example.com" },
        }),
      ),
    ).toThrow("origin");
  });
});
