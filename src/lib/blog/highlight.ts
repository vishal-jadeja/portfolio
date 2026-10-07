import "server-only";
import { createHighlighter } from "shiki";
import { visit } from "unist-util-visit";
import { inspectMarkdown } from "./markdown";
const languages = [
  "javascript",
  "typescript",
  "tsx",
  "jsx",
  "json",
  "bash",
  "python",
  "sql",
  "css",
  "html",
  "go",
  "yaml",
  "markdown",
];
const highlighter = createHighlighter({
  themes: ["github-light", "github-dark"],
  langs: languages,
});
export async function highlightMarkdown(markdown: string) {
  const engine = await highlighter;
  const output: Record<string, string> = {};
  visit(inspectMarkdown(markdown).tree, "code", (node) => {
    const lang =
      node.lang && languages.includes(node.lang) ? node.lang : "text";
    output[`${node.lang ? `language-${node.lang}` : ""}:${node.value}\n`] =
      engine.codeToHtml(node.value, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
      });
  });
  return output;
}
