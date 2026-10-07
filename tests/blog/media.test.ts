import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import type { Media } from "../../src/lib/blog/types";
const fake = vi.hoisted(() => ({
  bytes: Buffer.alloc(0),
  updates: [] as Record<string, unknown>[],
  outputs: [] as Buffer[],
}));
vi.mock("server-only", () => ({}));
vi.mock("../../src/lib/supabase/admin", () => ({
  adminClient: () => ({
    storage: {
      from: () => ({
        download: async () => ({
          data: new Blob([new Uint8Array(fake.bytes)]),
          error: null,
        }),
        upload: async (_path: string, bytes: Buffer) => {
          fake.outputs.push(bytes);
          return { error: null };
        },
      }),
    },
    from: () => ({
      update: (values: Record<string, unknown>) => {
        fake.updates.push(values);
        const chain = { eq: () => chain, error: null };
        return chain;
      },
    }),
  }),
}));
import { validateUpload } from "../../src/lib/blog/media";
function reservation(overrides: Partial<Media> = {}): Media {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    post_id: "22222222-2222-4222-8222-222222222222",
    owner_id: "33333333-3333-4333-8333-333333333333",
    private_object_path: "owner/post/image",
    public_object_path: null,
    mime_type: "image/png",
    bytes: fake.bytes.length,
    width: null,
    height: null,
    checksum: null,
    alt_text: "Diagram",
    caption: null,
    state: "pending",
    created_at: new Date().toISOString(),
    validated_at: null,
    ...overrides,
  };
}
beforeEach(() => {
  fake.updates.length = 0;
  fake.outputs.length = 0;
});
describe("server image validation", () => {
  it("decodes, bounds and re-encodes an image before marking ready", async () => {
    fake.bytes = await sharp({
      create: { width: 3000, height: 1000, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await validateUpload(reservation());
    expect(fake.updates[0]).toMatchObject({
      state: "ready",
      width: 2400,
      height: 800,
    });
    const output = await sharp(fake.outputs[0]).metadata();
    expect(output.format).toBe("webp");
    expect(fake.updates[0].checksum).toMatch(/^[a-f0-9]{64}$/);
  });
  it("rejects spoofed bytes and a mismatched MIME declaration", async () => {
    fake.bytes = Buffer.from("<html>not an image</html>");
    await expect(validateUpload(reservation())).rejects.toThrow();
    expect(fake.updates.at(-1)).toMatchObject({ state: "failed" });
    fake.bytes = await sharp({
      create: { width: 10, height: 10, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(
      validateUpload(reservation({ mime_type: "image/jpeg" })),
    ).rejects.toThrow("JPEG");
  });
  it("rejects oversize dimensions, byte mismatches and expired reservations", async () => {
    fake.bytes = await sharp({
      create: { width: 5000, height: 5000, channels: 3, background: "white" },
    })
      .png()
      .toBuffer();
    await expect(validateUpload(reservation())).rejects.toThrow();
    await expect(validateUpload(reservation({ bytes: 1 }))).rejects.toThrow(
      "size",
    );
    await expect(
      validateUpload(reservation({ created_at: "2020-01-01T00:00:00Z" })),
    ).rejects.toThrow("expired");
  });
});
