import { describe, expect, it } from "vitest";
import { HOME_PROJECT_COUNT, projects, type Project } from "../../src/data/projects";
import { filterProjects, sharedTech, statusLabel, techFamily } from "../../src/lib/projects";

const titles = (list: Project[]) => list.map((p) => p.title);

describe("project filters", () => {
  it("groups versioned and rebranded tech names", () => {
    expect(techFamily("Next.js 16")).toBe("Next.js");
    expect(techFamily("Tailwind CSS v4")).toBe("Tailwind CSS");
    expect(techFamily("Python 3.12")).toBe("Python");
    expect(techFamily("React.js")).toBe("React");
    expect(techFamily("PostgreSQL")).toBe("Postgres");
    expect(techFamily("NextAuth v5")).toBe("Auth.js");
    expect(techFamily("Chrome Manifest V3")).toBe("Chrome Manifest");
  });
  it("treats projects without a status as shipped", () => {
    const shipped = filterProjects(projects, "shipped", null);
    const building = filterProjects(projects, "in-progress", null);
    expect(shipped.length + building.length).toBe(projects.length);
    expect(shipped.every((p) => statusLabel(p) === "Shipped")).toBe(true);
    expect(titles(shipped)).toContain("Amazon Clone");
  });
  it("only offers stack filters shared by two or more projects, most used first", () => {
    const stack = sharedTech(projects);
    expect(stack.every((s) => s.count > 1)).toBe(true);
    expect(stack.map((s) => s.count)).toEqual([...stack.map((s) => s.count)].sort((a, b) => b - a));
    for (const { name, count } of stack) expect(filterProjects(projects, "all", name)).toHaveLength(count);
  });
  it("combines status and stack filters", () => {
    const list = filterProjects(projects, "in-progress", "Next.js");
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.status === "in-progress")).toBe(true);
  });
  it("keeps the home page to a preview of the full list", () => {
    expect(HOME_PROJECT_COUNT).toBeLessThan(projects.length);
  });
});
