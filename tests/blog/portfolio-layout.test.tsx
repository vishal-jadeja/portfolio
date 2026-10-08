import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(new URL(`../../src/${path}`, import.meta.url), "utf8");

describe("portfolio refresh", () => {
  it("uses the supplied Glitchover logo for both roles", async () => {
    const { default: Experience } = await import("../../src/components/sections/Experience");
    const html = renderToStaticMarkup(<Experience />);
    expect(html.match(/<img /g)).toHaveLength(2);
    expect(html).toContain("Glitchoverpng.png");
  });
  it("keeps the quote compact and the section separators shorter", () => {
    const quote = source("components/sections/Quote.tsx");
    expect(quote).toContain("py-6 sm:py-8");
    expect(quote).toContain("text-lg sm:text-xl");
    expect(quote).not.toContain("md:text-3xl");
    expect(source("components/SectionDivider.tsx")).toContain("height: 20");
    const page = source("app/page.tsx");
    const gearsToPersonal = page.slice(page.indexOf('<section id="gears"'), page.indexOf("<Personal />"));
    expect(gearsToPersonal).not.toContain("<SectionDivider />");
  });
  it("keeps technology icons in brand colors rather than inherited gray", async () => {
    const { default: Experience } = await import("../../src/components/sections/Experience");
    const html = renderToStaticMarkup(<Experience />);
    for (const color of ["#5FA04E", "#47A248", "#61DAFB", "#764ABC", "#34E27A", "#0052CC", "#00E7C3", "#8E75B2", "#5865F2"]) {
      expect(html).toContain(`color="${color}"`);
    }
  });
  it("shows role-specific technology badges above the achievements", async () => {
    const { default: Experience } = await import("../../src/components/sections/Experience");
    const html = renderToStaticMarkup(<Experience />);
    expect(html.match(/Technologies &amp; Tools/g)).toHaveLength(2);
    expect(html.match(/What I&apos;ve done|What I&#x27;ve done/g)).toHaveLength(2);
    for (const tool of ["Node.js", "Socket.io", "MongoDB", "React", "Vite", "RTK Query", "Razorpay", "Cashfree", "Stripe", "Gemini", "Cerebras", "Groq", "Express.js", "Passport.js", "JWT", "Jest", "Bitbucket Pipelines"]) {
      expect(html).toContain(tool);
    }
    expect(html.indexOf("Technologies &amp; Tools")).toBeLessThan(html.indexOf("Architected event-driven"));
    expect(html).not.toContain("Tailwind CSS");
  });
  it("includes ViShallTalk profiles with dedicated outline icons", async () => {
    const { socials } = await import("../../src/data/socials");
    expect(socials.find((social) => social.name === "X")?.url).toBe("https://x.com/ViShallTalk");
    expect(socials.find((social) => social.name === "Instagram")?.url).toBe("https://www.instagram.com/ViShallTalk/");
    expect(source("components/SocialIcon.tsx")).toContain("Instagram: TbBrandInstagram");
    expect(new Set(socials.map((social) => social.name)).size).toBe(socials.length);
  });
  it("labels the resume as a view action rather than a download", () => {
    const navbar = source("components/Navbar.tsx");
    expect(navbar).toContain('<span className="leading-none">Resume</span>');
    expect(navbar).toContain('className="block shrink-0"');
    expect(navbar).toContain('aria-label="View resume (PDF, opens in a new tab)"');
    expect(navbar).toContain("<TbExternalLink");
    expect(navbar).not.toContain("TbDownload");
    expect(navbar).toContain('href="/resume.pdf"');
  });
  it("removes the AI header actions while retaining search and theme controls", () => {
    const navbar = source("components/Navbar.tsx");
    expect(navbar).not.toContain("Talk to AI");
    expect(navbar).not.toContain("openChat");
    expect(navbar).toContain("<SearchButton");
    expect(navbar).toContain("<ThemeToggle />");
  });
  it("places writing before projects and includes gear and personal sections", () => {
    const page = source("app/page.tsx");
    expect(page.indexOf("<Hero />")).toBeLessThan(page.indexOf("<Experience />"));
    expect(page.indexOf("<Experience />")).toBeLessThan(page.indexOf("<Blog />"));
    expect(page.indexOf("<Blog />")).toBeLessThan(page.indexOf("<Projects />"));
    expect(page).toContain('href="/gears"');
    expect(page).not.toContain("<Gears />");
    expect(page).toContain("<Personal />");
    expect(page).toContain("<PortfolioShell showViews>");
  });

  it("renders the full gear inventory on its own page with a home link", () => {
    const page = source("app/gears/page.tsx");
    expect(page).toContain("<PortfolioShell>");
    expect(page).toContain("<Gears />");
    expect(page).toContain('href="/#gears"');
    expect(page).toContain("<h1");
    expect(source("lib/search/static-entries.ts")).toContain('href: "/gears"');
  });

  it("keeps social links inside the profile text block beneath the email", () => {
    const hero = source("components/sections/Hero.tsx");
    expect(hero).toContain('aria-label="Social profiles"');
    expect(hero.indexOf('aria-label="Social profiles"')).toBeGreaterThan(hero.indexOf("mailto:"));
    const tagline = "Building cool things, creating content, and learning a little bit of everything.";
    expect(hero).toContain(tagline);
    expect(hero.indexOf(tagline)).toBeGreaterThan(hero.lastIndexOf("</motion.div>"));
    expect(hero).toContain("w-20 h-20 sm:w-28 sm:h-28");
  });

  it("renders the supplied gear inventory and safe external links", async () => {
    const { default: Gears } = await import("../../src/components/sections/Gears");
    const html = renderToStaticMarkup(<Gears />);
    for (const name of ["Acer Nitro 5", "Motorola Edge 50", "GRENARO", "MAONO AU-400", "soundcore Q20i", "realme Buds T200 Lite", "Dell mouse", "Notion", "Ghostty", "DaVinci Resolve Studio", "OBS Studio", "Audacity", "Brave", "Grammarly", "Shazam", "Cinova", "BuyHatke", "YouTube playback speed controller", "Return YouTube Dislike", "Claude", "ChatGPT", "Dark Reader", "React DevTools", "Redux DevTools", "Claude Pro", "ChatGPT Go", "Epidemic Sound"]) {
      expect(html).toContain(name);
    }
    expect(html).toContain("https://github.com/vishal-jadeja/cinova");
    expect(html).toContain("https://share.epidemicsound.com/xiajcd");
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("does not invent personal favorites", async () => {
    const { default: Personal } = await import("../../src/components/sections/Personal");
    const html = renderToStaticMarkup(<Personal />);
    expect(html).toContain("Movies &amp; series");
    expect(html).toContain("Watchlist coming soon.");
  });

  it("makes experience details keyboard accessible without dropping achievements", () => {
    const experience = source("components/sections/Experience.tsx");
    expect(experience).toContain("<details");
    expect(experience).toContain("<summary");
    expect(experience).toContain("exp.achievements.map");
    expect(experience).toContain("exp.current");
  });

  it("uses compact portfolio typography and no emoji decorations", () => {
    const styles = source("app/globals.css");
    expect(styles).toContain("--text-base: 0.875rem");
    expect(styles).toContain("--text-2xl: 1.25rem");
    for (const path of ["data/skills.ts", "components/sections/Gears.tsx", "components/sections/Personal.tsx", "components/PortfolioChat/StarterQuestions.tsx", "components/sections/Projects.tsx"]) {
      expect(source(path)).not.toMatch(/[\p{Extended_Pictographic}↗]/u);
    }
  });
});
