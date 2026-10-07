import Image from "next/image";
import Markdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { inspectMarkdown } from "@/lib/blog/markdown";
import type { MediaView } from "@/lib/blog/types";
import CopyCode from "./CopyCode";

export function ArticleImage({
  media,
  alt,
  preview = false,
  preload = false,
}: {
  media: MediaView;
  alt?: string;
  preview?: boolean;
  preload?: boolean;
}) {
  return (
    <span className="blog-figure">
      <Image
        src={media.url}
        alt={alt || media.alt_text}
        width={media.width}
        height={media.height}
        sizes="(max-width: 640px) calc(100vw - 42px), (max-width: 840px) calc(100vw - 66px), 774px"
        unoptimized={preview}
        preload={preload}
      />
      {media.caption && <span className="blog-caption">{media.caption}</span>}
    </span>
  );
}
export default function ArticleBody({
  markdown,
  media,
  preview = false,
  highlights = {},
}: {
  markdown: string;
  media: MediaView[];
  preview?: boolean;
  highlights?: Record<string, string>;
}) {
  const analysis = inspectMarkdown(markdown);
  let headingIndex = 0;
  const heading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    function Heading({ children }: { children?: React.ReactNode }) {
      const id = analysis.headings[headingIndex++]?.id;
      return (
        <Tag id={id}>
          <a href={`#${id}`} className="blog-heading-anchor">
            {children}
          </a>
        </Tag>
      );
    };
  return (
    <div className="blog-prose">
      <Markdown
        skipHtml
        remarkPlugins={[remarkGfm]}
        urlTransform={(url, key) =>
          key === "src" && /^media:[0-9a-f-]+$/i.test(url)
            ? url
            : defaultUrlTransform(url)
        }
        components={{
          h1: heading("h2"),
          h2: heading("h2"),
          h3: heading("h3"),
          h4: heading("h4"),
          h5: heading("h5"),
          h6: heading("h6"),
          img: ({ src, alt }) => {
            const asset =
              typeof src === "string"
                ? media.find((m) => `media:${m.id}` === src.toLowerCase())
                : undefined;
            return asset ? (
              <ArticleImage media={asset} alt={alt} preview={preview} />
            ) : (
              <span className="blog-unresolved">
                Image needs uploading{alt ? `: ${alt}` : ""}
              </span>
            );
          },
          a: ({ href, children }) => (
            <a
              href={href}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="blog-table-scroll">
              <table>{children}</table>
            </div>
          ),
          pre: ({ children }) => (
            <div className="blog-code-block">{children}</div>
          ),
          code: ({ children, className }) => {
            const code = String(children);
            const isBlock =
              Boolean(className?.startsWith("language-")) ||
              code.endsWith("\n");
            const html = highlights[`${className ?? ""}:${code}`];
            return isBlock ? (
              <div className="blog-code-inner">
                <CopyCode code={code} />
                {html ? (
                  <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                  <pre>
                    <code className={className}>{children}</code>
                  </pre>
                )}
              </div>
            ) : (
              <code>{children}</code>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
