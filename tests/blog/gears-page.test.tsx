import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Gears from "../../src/components/sections/Gears";
import { gearGroups } from "../../src/data/gears";

describe("gears directory", () => {
  it("keeps all 27 items and provides a safe link for each", () => {
    const items = gearGroups.flatMap((group) => group.items);
    expect(items).toHaveLength(27);
    for (const item of items) {
      expect(item.url).toMatch(/^https:\/\//);
    }
    const html = renderToStaticMarkup(<Gears />);
    expect(html.match(/target="_blank"/g)).toHaveLength(27);
    expect(html.match(/rel="noopener noreferrer"/g)).toHaveLength(27);
  });

  it("provides five navigable categories with hardware and tool lists", () => {
    const html = renderToStaticMarkup(<Gears />);
    expect(html).toContain('aria-label="Gear categories"');
    for (const id of ["hardware", "software", "extensions", "ai", "music"]) {
      expect(html).toContain(`href="#${id}"`);
      expect(html).toContain(`id="${id}"`);
    }
    expect(html).toContain("gear-items-list");
    expect(html.match(/class="gear-item-row"/g)).toHaveLength(27);
    expect(html).toContain("Devices &amp; accessories");
  });

  it("discloses referral and unresolved extension destinations", () => {
    const html = renderToStaticMarkup(<Gears />);
    expect(html).toContain("Referral link");
    expect(html).toContain("Browse extensions");
    expect(html).toContain("Official app");
    expect(html).toContain("share.epidemicsound.com/xiajcd");
    expect(html).toContain("github.com/vishal-jadeja/cinova");
  });

  it("uses the portfolio background and single-column lists", () => {
    const css = readFileSync(new URL("../../src/app/globals.css", import.meta.url), "utf8");
    expect(css).not.toContain(":root.dark .gears-page");
    const gearStyles = css.slice(css.indexOf(".gears-page {"), css.indexOf(".personal-watchlist"));
    expect(gearStyles).not.toContain("gradient(");
    expect(gearStyles).not.toContain("display: grid");
    expect(css).toContain(".gear-items-list");
    expect(css).toContain(".gear-item-row");
    const page = readFileSync(new URL("../../src/app/gears/page.tsx", import.meta.url), "utf8");
    expect(page).toContain('className="gears-page"');
  });
});
