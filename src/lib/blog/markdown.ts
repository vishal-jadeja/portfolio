import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Root, Image, Link, Definition, Heading } from "mdast";
import { slugify } from "./schemas";

function textOf(node: { value?: string; children?: unknown[] }): string {
  return (
    node.value ??
    (node.children ?? []).map((child) => textOf(child as typeof node)).join("")
  );
}
export function inspectMarkdown(markdown: string) {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .parse(markdown) as Root;
  const media = new Set<string>();
  const errors: string[] = [];
  const definitions = new Map<string, Definition>();
  const headings: { id: string; title: string; depth: number }[] = [];
  const counts = new Map<string, number>();
  visit(tree, "definition", (node: Definition) => {
    definitions.set(node.identifier.toLowerCase(), node);
  });
  function image(url: string, alt: string | null | undefined) {
    const match =
      /^media:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i.exec(
        url,
      );
    if (!match) errors.push(`Upload or map image: ${url.slice(0, 100)}`);
    else media.add(match[1].toLowerCase());
    if (!alt?.trim()) errors.push("Every image needs alt text.");
  }
  function link(url: string) {
    if (!/^(https?:|mailto:|#|\/(?!\/))/i.test(url))
      errors.push("Links must use HTTPS, HTTP, mailto, or a local path.");
  }
  visit(tree, (node) => {
    if (node.type === "html")
      errors.push("Raw HTML is not supported. Use Markdown.");
    if (node.type === "image") image((node as Image).url, (node as Image).alt);
    if (node.type === "imageReference") {
      const definition = definitions.get(node.identifier.toLowerCase());
      if (definition) image(definition.url, node.alt);
      else errors.push("Unresolved image reference.");
    }
    if (node.type === "link") link((node as Link).url);
    if (node.type === "linkReference") {
      const definition = definitions.get(node.identifier.toLowerCase());
      if (definition) link(definition.url);
    }
    if (node.type === "heading") {
      const heading = node as Heading;
      const title = textOf(heading);
      const base = slugify(title) || "section";
      const count = (counts.get(base) ?? 0) + 1;
      counts.set(base, count);
      headings.push({
        id: count === 1 ? base : `${base}-${count}`,
        title,
        depth: heading.depth,
      });
    }
  });
  return {
    tree,
    mediaIds: [...media],
    errors: [...new Set(errors)],
    headings,
    readingMinutes: Math.max(
      1,
      Math.ceil(textOf(tree).split(/\s+/).filter(Boolean).length / 220),
    ),
  };
}
export function safeJson(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export function xml(value: string) {
  return value.replace(
    /[<>&"']/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
}
