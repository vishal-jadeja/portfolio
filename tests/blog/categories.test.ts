import { describe, expect, it } from "vitest";
import { categoryLabel, categoryCounts } from "../../src/lib/blog/categories";
describe("published categories", () => {
  it("counts a category once per post and normalizes legacy casing", () => {
    expect(categoryCounts([
      { tags: ["AI", "ai", " Personal "] },
      { tags: ["ai", "engineering"] },
      { tags: [] },
    ])).toEqual([
      { tag: "ai", label: "AI", count: 2 },
      { tag: "engineering", label: "Engineering", count: 1 },
      { tag: "personal", label: "Personal", count: 1 },
    ]);
  });
  it("preserves familiar technical names in category labels", () => {
    expect(categoryLabel("ai")).toBe("AI");
    expect(categoryLabel("next.js")).toBe("Next.js");
    expect(categoryLabel("nextjs")).toBe("Next.js");
    expect(categoryLabel("personal")).toBe("Personal");
    expect(categoryLabel("machine-learning")).toBe("Machine Learning");
  });
});
