---
title: Building a quieter place to write
slug: building-a-quieter-place-to-write
excerpt: A minimal blog, a private writing space, and a publishing flow that keeps the two in sync.
tags: [engineering, design, nextjs]
seo_title: Building a minimal portfolio blog
seo_description: The architecture behind a readable portfolio blog, with private drafts, image uploads, and a reliable publishing workflow.
---

Good writing needs room. A clear title, comfortable type, a few useful images, and a page that gets out of the way.

That was the starting point for this blog: make reading feel effortless, then make publishing just as straightforward. The result is a small system with distinct places for **working on an idea** and **sharing the finished article**.

## Start with the reading experience

The article is the centre of the page. There is no carousel to navigate, no animation to wait for, and no account required to read.

A narrow column keeps long paragraphs comfortable. Section headings give the argument a shape. Code has its own typeface, images keep their proportions, and the light and dark themes use the same layout.

The design choices are deliberately restrained:

- A serif title gives each article a little character.
- A clear sans-serif font carries the longer text.
- Dates, reading time, and captions sit quietly beside the content.
- Links remain recognisable before you hover over them.

> The interface should help you stay with the idea, one paragraph at a time.

## Give drafts a private home

Writing rarely happens in one sitting. An introduction changes, a diagram needs another pass, and a paragraph that seemed finished gets rewritten the next morning.

A published article should remain stable through all of that. The editor saves a private working copy. Publishing creates a separate snapshot for readers.

![Private drafts flow through a publish operation into a public snapshot, which is served to readers.](media:66666666-6666-4666-8666-666666666666)

The useful distinction is simple: **Save** protects your work; **Publish** updates the public page. Revising a draft does not replace the article that somebody is already reading.

## Keep the architecture small

The portfolio and blog share one application. The public pages render on the server, the database stores content, and object storage serves the images.

| Part | Responsibility |
| --- | --- |
| Writing studio | Edit Markdown, upload images, and preview a draft |
| Private draft | Keep the latest working copy |
| Published snapshot | Store the version readers should see |
| Page cache | Reuse public results between visits |
| Image storage | Serve responsive, immutable published assets |

An article can use code without turning the reader into an application developer. Here is the shape of the publication step:

```typescript
async function publishArticle(id: string, expectedVersion: number) {
  const draft = await getPrivateDraft(id);

  if (draft.version !== expectedVersion) {
    throw new Error("The draft changed. Reload before publishing.");
  }

  await validateArticle(draft);
  await savePublishedSnapshot(draft);
  await refreshPublicPages(draft.slug);
}
```

This is an illustrative example. The actual publication operation also validates image ownership and uses a database transaction to keep the public snapshot consistent.

## Images belong to the story

An image should explain something. Upload it once, give it useful alt text, and place it where it helps the reader.

Draft images stay private. When the article is published, its selected images become public assets with stable paths. Dimensions are known before the page loads, so the text does not jump around while a diagram appears.

For technical writing, this means screenshots and diagrams can remain legible instead of being forced into a decorative crop.

## Publish something worth sharing

The public URL is permanent. A shared link carries the article's own title, description, and image. Search metadata, structured data, the sitemap, and the RSS feed update with the published version.

You can return to the studio later, refine the argument, preview the changes, and publish an update when it is ready. The first publication date stays intact.

The architecture supports that workflow. The interesting part is what you choose to write next.
