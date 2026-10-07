"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ArticleBody from "@/components/blog/ArticleBody";
import {
  saveDraftAction,
  publishPostAction,
  setPostStateAction,
  refreshPublicAction,
} from "@/lib/blog/actions";
import { importMarkdown } from "@/lib/blog/import";
import { slugify } from "@/lib/blog/schemas";
import { browserClient } from "@/lib/supabase/browser";
import type { Draft, DraftFields, MediaView } from "@/lib/blog/types";

function fieldsOf(draft: Draft): DraftFields {
  const {
    title,
    slug,
    excerpt,
    body_markdown,
    tags,
    cover_media_id,
    seo_title,
    seo_description,
  } = draft;
  return {
    title,
    slug,
    excerpt,
    body_markdown,
    tags,
    cover_media_id,
    seo_title,
    seo_description,
  };
}
export default function PostEditor({
  initial,
  initialMedia,
  publishedVersion,
}: {
  initial: Draft;
  initialMedia: MediaView[];
  publishedVersion: number | null;
}) {
  const router = useRouter();
  const [fields, setFields] = useState(() => fieldsOf(initial));
  const [tagsText, setTagsText] = useState(initial.tags.join(", "));
  const [media, setMedia] = useState(initialMedia);
  const [message, setMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [publication, setPublication] = useState(publishedVersion);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const version = useRef(initial.version);
  const latest = useRef(fields);
  const saved = useRef(JSON.stringify(fields));
  const saving = useRef<Promise<number | null> | null>(null);
  const halted = useRef(false);
  const dirty = useRef(false);
  const locked = useRef(false);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const importInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);
  const [hasPublished, setHasPublished] = useState(
    Boolean(initial.first_published_at),
  );
  const [archived, setArchived] = useState(Boolean(initial.archived_at));

  const save = useCallback(async (): Promise<number | null> => {
    if (saving.current) {
      const result = await saving.current;
      if (result === null) return null;
    }
    if (halted.current || archived) return null;
    const snapshot = latest.current;
    const serialized = JSON.stringify(snapshot);
    if (serialized === saved.current) return version.current;
    setSaveStatus("Saving…");
    const operation = (async () => {
      const result = await saveDraftAction(
        initial.id,
        version.current,
        snapshot,
      );
      if (!result.ok) {
        setSaveStatus("Save failed");
        setMessage(result.error);
        if (result.error.includes("Conflict")) halted.current = true;
        return null;
      }
      version.current = result.data.version;
      saved.current = serialized;
      dirty.current = JSON.stringify(latest.current) !== serialized;
      setSaveStatus(dirty.current ? "Unsaved changes" : "Saved");
      return version.current;
    })();
    saving.current = operation;
    try {
      return await operation;
    } finally {
      if (saving.current === operation) saving.current = null;
    }
  }, [initial.id, archived]);

  useEffect(() => {
    if (archived || !dirty.current || locked.current || halted.current) return;
    const timer = setTimeout(() => {
      void save();
    }, 1500);
    return () => clearTimeout(timer);
  }, [fields, archived, save]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (dirty.current || saving.current) event.preventDefault();
    };
    const click = (event: MouseEvent) => {
      const anchor = (event.target as Element).closest("a");
      if (
        anchor &&
        anchor.target !== "_blank" &&
        dirty.current &&
        !window.confirm("Leave with unsaved changes?")
      )
        event.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", click);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", click);
    };
  }, []);
  function change<K extends keyof DraftFields>(key: K, value: DraftFields[K]) {
    if (locked.current || archived) return;
    const next = { ...latest.current, [key]: value };
    latest.current = next;
    dirty.current = JSON.stringify(next) !== saved.current;
    setFields(next);
    setSaveStatus("Unsaved changes");
  }
  function insert(before: string, after = "") {
    const node = textArea.current;
    const start = node?.selectionStart ?? latest.current.body_markdown.length;
    const end = node?.selectionEnd ?? start;
    const body = latest.current.body_markdown;
    change(
      "body_markdown",
      `${body.slice(0, start)}${before}${body.slice(start, end)}${after}${body.slice(end)}`,
    );
    requestAnimationFrame(() => {
      node?.focus();
      node?.setSelectionRange(start + before.length, end + before.length);
    });
  }
  async function run(task: () => Promise<void>) {
    if (locked.current) return;
    locked.current = true;
    setBusy(true);
    setMessage("");
    try {
      await task();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Operation failed. Please retry.",
      );
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }
  async function publish() {
    await run(async () => {
      let current = await save();
      if (current === null) return;
      if (dirty.current) current = await save();
      if (current === null) return;
      const result = await publishPostAction(initial.id, current);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setHasPublished(true);
      setPublication(current);
      setMessage(
        result.warning ??
          `Published. Your article is ready at /blog/${result.data.slug}`,
      );
    });
  }
  async function state(action: "unpublish" | "archive" | "restore") {
    if (
      action !== "restore" &&
      !window.confirm(
        action === "archive"
          ? "Archive this article? Its public page will be unpublished."
          : "Unpublish this article? Published image URLs may remain public.",
      )
    )
      return;
    await run(async () => {
      if (action !== "restore" && dirty.current && (await save()) === null)
        return;
      const result = await setPostStateAction(initial.id, action);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage(result.warning ?? "Saved.");
      if (result.warning) {
        setArchived(action === "archive");
        if (action !== "restore") setPublication(null);
        version.current += 1;
      } else {
        router.push("/admin/blog");
        router.refresh();
      }
    });
  }
  async function importFile(file: File) {
    await run(async () => {
      if (
        dirty.current &&
        !window.confirm("Replace the editor contents with this Markdown file?")
      )
        return;
      const imported = importMarkdown(await file.text(), file.name);
      const next = {
        ...imported,
        slug: hasPublished ? latest.current.slug : imported.slug,
      };
      latest.current = next;
      dirty.current = true;
      setFields(next);
      setTagsText(next.tags.join(", "));
      setSaveStatus("Unsaved changes");
      setMessage(
        "Imported as a draft. Upload and map any unresolved images before publishing.",
      );
    });
  }
  async function upload(file: File) {
    if (!alt.trim()) {
      setMessage("Add alt text before uploading an image.");
      return;
    }
    await run(async () => {
      const reserved = await fetch("/api/admin/blog/media/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: initial.id,
          bytes: file.size,
          mime_type: file.type,
          alt_text: alt.trim(),
          caption: caption.trim() || null,
        }),
      });
      const reservation = await reserved.json();
      if (!reserved.ok) throw new Error(reservation.error);
      const { error } = await browserClient()
        .storage.from("blog-drafts")
        .uploadToSignedUrl(reservation.path, reservation.token, file, {
          contentType: file.type,
        });
      if (error) throw new Error("Image upload failed. Please retry.");
      const completed = await fetch("/api/admin/blog/media/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: reservation.id }),
      });
      const result = await completed.json();
      if (!completed.ok) throw new Error(result.error);
      setMedia((previous) => [...previous, result.media]);
      setAlt("");
      setCaption("");
      setMessage("Image uploaded. Insert it below or choose it as the cover.");
    });
  }
  const status = archived
    ? "Archived"
    : publication === null
      ? "Draft"
      : publication === version.current && !dirty.current
        ? "Published"
        : "Published with unpublished changes";
  return (
    <>
      <Link
        href="/admin/blog"
        className="blog-back"
        style={{ marginTop: 28, marginBottom: 0 }}
      >
        ← All articles
      </Link>
      <div className="blog-editor-header">
        <div>
          <h1>{fields.title || "Untitled article"}</h1>
          <span className="blog-status">{status}</span>
        </div>
        <div className="blog-admin-actions">
          {!archived && (
            <>
              <button
                className="blog-button secondary"
                disabled={busy}
                onClick={() => {
                  halted.current = false;
                  void run(async () => {
                    await save();
                  });
                }}
              >
                Save
              </button>
              <button
                className="blog-button secondary"
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    if ((await save()) !== null)
                      window.open(
                        `/admin/blog/${initial.id}/preview`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                  })
                }
              >
                Preview
              </button>
              <button className="blog-button" disabled={busy} onClick={publish}>
                {busy
                  ? "Working…"
                  : publication === null
                    ? "Publish"
                    : "Publish updates"}
              </button>
            </>
          )}
          {archived && (
            <button
              className="blog-button"
              disabled={busy}
              onClick={() => state("restore")}
            >
              Restore article
            </button>
          )}
        </div>
      </div>
      <p role="status" className="blog-message">
        {saveStatus}
        {message ? ` · ${message}` : ""}
      </p>
      {halted.current && (
        <p className="blog-message error">
          Another tab saved a newer draft. Export your local text below, then{" "}
          <button onClick={() => window.location.reload()}>
            reload this page
          </button>
          .
        </p>
      )}
      <div className="blog-editor-layout">
        <div>
          <fieldset disabled={busy || archived}>
            <label className="blog-field">
              Title
              <input
                value={fields.title}
                maxLength={160}
                onChange={(e) => change("title", e.target.value)}
              />
            </label>
            <label className="blog-field">
              Description
              <textarea
                aria-label="Description"
                value={fields.excerpt}
                rows={3}
                maxLength={300}
                onChange={(e) => change("excerpt", e.target.value)}
              />
              <small>Shown in article lists and social previews.</small>
            </label>
            <label className="blog-field">
              URL slug
              <input
                aria-label="URL slug"
                value={fields.slug}
                maxLength={120}
                readOnly={hasPublished}
                onChange={(e) => change("slug", e.target.value)}
              />
              <small>
                {hasPublished ? (
                  "This permanent URL is locked after publication."
                ) : (
                  <button
                    type="button"
                    onClick={() => change("slug", slugify(fields.title))}
                  >
                    Generate from title
                  </button>
                )}
              </small>
            </label>
            <div
              className="blog-toolbar"
              role="toolbar"
              aria-label="Markdown formatting"
            >
              {[
                ["Heading", "\n## ", ""],
                ["Bold", "**", "**"],
                ["Italic", "*", "*"],
                ["Link", "[", "](https://)"],
                ["List", "\n- ", ""],
                ["Quote", "\n> ", ""],
                ["Code", "\n```typescript\n", "\n```\n"],
                [
                  "Table",
                  "\n| Heading | Heading |\n| --- | --- |\n| Value | Value |\n",
                  "",
                ],
              ].map(([label, before, after]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => insert(before, after)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="blog-field">
              Article (Markdown)
              <textarea
                ref={textArea}
                className="blog-editor-markdown"
                value={fields.body_markdown}
                onChange={(e) => change("body_markdown", e.target.value)}
                spellCheck={false}
              />
            </label>
          </fieldset>
          <div className="blog-admin-actions">
            <button
              type="button"
              className="blog-button secondary"
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? "Hide live preview" : "Show live preview"}
            </button>
            <button
              type="button"
              className="blog-button secondary"
              disabled={busy || archived}
              onClick={() => importInput.current?.click()}
            >
              Import .md
            </button>
            <button
              className="blog-button secondary"
              type="button"
              onClick={() => {
                const text = `---\ntitle: ${JSON.stringify(fields.title)}\nslug: ${JSON.stringify(fields.slug)}\nexcerpt: ${JSON.stringify(fields.excerpt)}\ntags: ${JSON.stringify(fields.tags)}\n---\n\n${fields.body_markdown}`;
                const url = URL.createObjectURL(
                  new Blob([text], { type: "text/markdown" }),
                );
                const a = document.createElement("a");
                a.href = url;
                a.download = `${fields.slug}.md`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export current text
            </button>
          </div>
          <input
            ref={importInput}
            type="file"
            accept=".md"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = "";
            }}
          />
          {preview && (
            <div className="blog-preview-inline">
              <h2>{fields.title || "Untitled article"}</h2>
              <ArticleBody
                markdown={fields.body_markdown}
                media={media}
                preview
              />
            </div>
          )}
        </div>
        <aside className="blog-editor-aside">
          <fieldset disabled={busy || archived}>
            <h2>Article details</h2>
            <label className="blog-field">
              Categories
              <input
                aria-label="Categories"
                placeholder="AI, Personal, Engineering"
                value={tagsText}
                onChange={(e) => {
                  setTagsText(e.target.value);
                  change(
                    "tags",
                    e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  );
                }}
              />
              <small>Up to 5 categories, separated by commas. For example: AI, Personal, Engineering.</small>
            </label>
            <label className="blog-field">
              Cover image
              <select
                value={fields.cover_media_id ?? ""}
                onChange={(e) =>
                  change("cover_media_id", e.target.value || null)
                }
              >
                <option value="">No cover</option>
                {media.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.alt_text.slice(0, 45)}
                  </option>
                ))}
              </select>
            </label>
            <details>
              <summary className="blog-editor-note">
                Search engine overrides
              </summary>
              <p className="blog-editor-note">
                Optional: describe this article clearly for search results. Your
                title and description are used automatically when these are
                empty.
              </p>
              <label className="blog-field">
                SEO title
                <input
                  maxLength={160}
                  value={fields.seo_title ?? ""}
                  onChange={(e) => change("seo_title", e.target.value || null)}
                />
              </label>
              <label className="blog-field">
                SEO description
                <textarea
                  maxLength={300}
                  rows={3}
                  value={fields.seo_description ?? ""}
                  onChange={(e) =>
                    change("seo_description", e.target.value || null)
                  }
                />
              </label>
            </details>
            <h2>Images</h2>
            <label className="blog-field">
              Alt text
              <input
                value={alt}
                maxLength={1000}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Describe the image"
              />
            </label>
            <label className="blog-field">
              Caption (optional)
              <input
                value={caption}
                maxLength={1000}
                onChange={(e) => setCaption(e.target.value)}
              />
            </label>
            <button
              className="blog-button secondary"
              type="button"
              onClick={() => uploadInput.current?.click()}
            >
              Upload image +
            </button>
            <input
              ref={uploadInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.target.value = "";
              }}
            />
            <p className="blog-editor-note">
              JPEG, PNG or WebP · max 5MB. Draft images stay private until
              publication.
            </p>
            <div className="blog-media-list">
              {media.map((m) => (
                <div className="blog-media-item" key={m.id}>
                  <Image
                    src={m.url}
                    alt={m.alt_text}
                    width={m.width}
                    height={m.height}
                    unoptimized
                  />
                  <p>{m.alt_text}</p>
                  <button
                    type="button"
                    onClick={() =>
                      insert(
                        `\n![${m.alt_text.replace(/[\[\]\\]/g, "")}](media:${m.id})\n`,
                      )
                    }
                  >
                    Insert
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const source = window.prompt(
                        "Paste the exact Markdown image URL to replace (for example ./diagram.png)",
                      );
                      if (source)
                        change(
                          "body_markdown",
                          latest.current.body_markdown
                            .split(source)
                            .join(`media:${m.id}`),
                        );
                    }}
                  >
                    Map imported image
                  </button>
                </div>
              ))}
            </div>
          </fieldset>
          <h2>Manage</h2>
          <div className="blog-admin-actions">
            {publication !== null && (
              <>
                <Link
                  href={`/blog/${fields.slug}`}
                  target="_blank"
                  className="blog-button secondary"
                >
                  View live
                </Link>
                <button
                  className="blog-button secondary"
                  disabled={busy}
                  onClick={() => state("unpublish")}
                >
                  Unpublish
                </button>
              </>
            )}
            {!archived && (
              <button
                className="blog-button secondary"
                disabled={busy}
                onClick={() => state("archive")}
              >
                Archive
              </button>
            )}
            <button
              className="blog-button secondary"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const result = await refreshPublicAction(initial.id);
                  setMessage(
                    result.ok ? "Public caches expired." : result.error,
                  );
                })
              }
            >
              Refresh public pages
            </button>
            <a
              className="blog-button secondary"
              href={`/api/admin/blog/${initial.id}/export`}
            >
              Export saved draft
            </a>
          </div>
          <p className="blog-editor-note">
            Published image URLs can remain publicly accessible after
            unpublishing. Export includes an asset manifest; download the
            private assets separately for a complete backup.
          </p>
        </aside>
      </div>
    </>
  );
}
