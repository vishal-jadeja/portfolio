import { describe, expect, it } from "vitest";
import { hoverPreviewOffset } from "../../src/lib/blog/hover-preview";

const card = { left: 400, top: 250, width: 714, height: 120 };
const preview = { width: 300, height: 158 };
const viewport = { width: 1440, height: 900 };

describe("blog cover tracking", () => {
  it("tracks movement over the beginning of a title instead of pinning to the card edge", () => {
    const first = hoverPreviewOffset({ x: 415, y: 270 }, card, preview, viewport);
    const next = hoverPreviewOffset({ x: 455, y: 280 }, card, preview, viewport);
    expect(next.x - first.x).toBe(40);
    expect(next.y - first.y).toBe(10);
  });
  it("keeps the preview within the right viewport edge", () => {
    const offset = hoverPreviewOffset({ x: 1430, y: 270 }, card, preview, viewport);
    const right = card.left + card.width + offset.x;
    expect(right).toBe(viewport.width - 8);
  });
  it("places the preview above the pointer near the bottom of the viewport", () => {
    const offset = hoverPreviewOffset({ x: 600, y: 880 }, card, preview, viewport);
    const top = card.top + card.height / 2 - preview.height / 2 + offset.y;
    expect(top + preview.height).toBe(880 - 24);
    expect(top).toBeGreaterThanOrEqual(8);
  });
});
