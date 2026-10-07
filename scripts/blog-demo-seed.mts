/** Local preview seed only. It is never used by production queries. */
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import type { PGlite } from "@electric-sql/pglite";
import matter from "gray-matter";
import { load, JSON_SCHEMA } from "js-yaml";
import type { DraftFields } from "../src/lib/blog/types.js";

export async function seedBlogDemo(
  db: PGlite,
  objects: Map<string, Buffer>,
  owner: string,
  postId: string,
) {
  const source = await readFile(
    new URL(
      "../examples/blog/building-a-quieter-place-to-write.md",
      import.meta.url,
    ),
    "utf8",
  );
  const parsed = matter(source, {
    language: "yaml",
    engines: {
      yaml: (text) => {
        const value = load(text, { schema: JSON_SCHEMA });
        if (!value || typeof value !== "object" || Array.isArray(value))
          throw new Error("Sample frontmatter must be a mapping.");
        return value;
      },
    },
  });
  const article = {
    ...parsed.data,
    body_markdown: parsed.content,
  } as DraftFields;
  const cover = "55555555-5555-4555-8555-555555555555";
  const diagram = "66666666-6666-4666-8666-666666666666";
  const assets = [
    {
      id: cover,
      name: "cover",
      width: 1400,
      height: 760,
      alt: "A minimal writing desk illustrated with an open notebook, a pencil, and a quiet publishing interface.",
      caption: "A little space for the next idea.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="760" viewBox="0 0 1400 760"><rect width="1400" height="760" fill="#eae7df"/><circle cx="1170" cy="120" r="290" fill="#dfdbd0"/><rect x="185" y="156" width="810" height="466" rx="18" fill="#d6d0c3" transform="rotate(-5 590 390)"/><rect x="190" y="135" width="800" height="460" rx="16" fill="#faf9f5" transform="rotate(-5 590 365)"/><g transform="rotate(-5 590 365)"><path d="M590 135V595" stroke="#e5e1d7" stroke-width="3"/><rect x="235" y="192" width="180" height="12" rx="6" fill="#5e6e5e"/><rect x="235" y="228" width="290" height="6" rx="3" fill="#d5d2c9"/><rect x="235" y="249" width="265" height="6" rx="3" fill="#d5d2c9"/><rect x="235" y="270" width="285" height="6" rx="3" fill="#d5d2c9"/><rect x="235" y="325" width="310" height="180" rx="8" fill="#eeece5"/><circle cx="390" cy="405" r="52" fill="#cbd4c8"/><path d="M350 430L390 375L430 430" fill="none" stroke="#667762" stroke-width="4"/><g fill="#ddd9cf"><rect x="637" y="192" width="290" height="7" rx="3"/><rect x="637" y="221" width="260" height="7" rx="3"/><rect x="637" y="250" width="275" height="7" rx="3"/><rect x="637" y="310" width="290" height="7" rx="3"/><rect x="637" y="339" width="260" height="7" rx="3"/><rect x="637" y="368" width="290" height="7" rx="3"/></g><rect x="637" y="449" width="120" height="34" rx="17" fill="#6f7e68"/></g><g transform="rotate(18 1135 455)"><rect x="1120" y="230" width="24" height="395" rx="8" fill="#747d6b"/><rect x="1120" y="230" width="24" height="30" rx="7" fill="#c6b9a9"/><path d="M1120 625L1132 654L1144 625" fill="#cbb897"/><path d="M1128 644L1132 654L1136 644" fill="#353a31"/></g><circle cx="1140" cy="154" r="58" fill="#bdb6a7"/><circle cx="1140" cy="149" r="50" fill="#faf9f5"/><circle cx="1140" cy="149" r="35" fill="#695342"/></svg>`,
    },
    {
      id: diagram,
      name: "publication-flow",
      width: 1400,
      height: 620,
      alt: "Private draft, publish transaction, public snapshot, and cached reading page connected from left to right.",
      caption:
        "The working copy and the public article have separate responsibilities.",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="620" viewBox="0 0 1400 620"><rect width="1400" height="620" rx="20" fill="#f1f0eb"/><text x="80" y="100" font-family="Arial,sans-serif" font-size="19" letter-spacing="4" fill="#6b7064">FROM IDEA TO ARTICLE</text><path d="M327 320H395M639 320H705M949 320H1015" stroke="#979d90" stroke-width="3"/><path d="M385 311L398 320L385 329M695 311L708 320L695 329M1005 311L1018 320L1005 329" fill="none" stroke="#979d90" stroke-width="3"/><g font-family="Arial,sans-serif"><rect x="80" y="232" width="247" height="180" rx="12" fill="#fafaf7" stroke="#d3d6cc"/><text x="105" y="279" font-size="14" fill="#7c8574">01 / WORKING COPY</text><text x="105" y="326" font-size="25" fill="#283325">Private draft</text><text x="105" y="365" font-size="17" fill="#7b8074">Save as you write</text><rect x="397" y="232" width="242" height="180" rx="12" fill="#dfe5da" stroke="#c2cfb9"/><text x="422" y="279" font-size="14" fill="#6c7f61">02 / REVIEW</text><text x="422" y="326" font-size="25" fill="#283325">Publish</text><text x="422" y="365" font-size="17" fill="#6c7f61">Validate and commit</text><rect x="707" y="232" width="242" height="180" rx="12" fill="#fafaf7" stroke="#d3d6cc"/><text x="732" y="279" font-size="14" fill="#7c8574">03 / PUBLIC VERSION</text><text x="732" y="326" font-size="25" fill="#283325">Snapshot</text><text x="732" y="365" font-size="17" fill="#7b8074">A stable article</text><rect x="1017" y="232" width="303" height="180" rx="12" fill="#fafaf7" stroke="#d3d6cc"/><text x="1042" y="279" font-size="14" fill="#7c8574">04 / DELIVERY</text><text x="1042" y="326" font-size="25" fill="#283325">Reading page</text><text x="1042" y="365" font-size="17" fill="#7b8074">Cached HTML + images</text><text x="80" y="530" font-size="17" fill="#7b8074">Editing a draft never changes the published article until you publish the update.</text></g></svg>`,
    },
  ];
  await db.exec("reset role;");
  await db.query("delete from public.blog_publications");
  await db.query("delete from public.blog_posts where id <> $1", [postId]);
  for (const asset of assets) {
    const image = await sharp(Buffer.from(asset.svg))
      .webp({ quality: 92 })
      .toBuffer();
    const path = `demo/${asset.name}.webp`;
    objects.set(`blog-public/${path}`, image);
    objects.set(`blog-drafts/demo/${asset.name}`, image);
    objects.set(`blog-drafts/demo/${asset.name}.webp`, image);
    await db.query(
      "insert into public.blog_media(id,owner_id,post_id,private_object_path,public_object_path,mime_type,bytes,width,height,checksum,alt_text,caption,state,validated_at) values($1,$2,$3,$4,$5,'image/webp',$6,$7,$8,$9,$10,$11,'ready',now())",
      [
        asset.id,
        owner,
        postId,
        `demo/${asset.name}`,
        path,
        image.length,
        asset.width,
        asset.height,
        createHash("sha256").update(image).digest("hex"),
        asset.alt,
        asset.caption,
      ],
    );
  }
  await db.query(
    "update public.blog_posts set slug=$2,title=$3,excerpt=$4,body_markdown=$5,tags=$6,cover_media_id=$7,seo_title=$8,seo_description=$9,version=3 where id=$1",
    [
      postId,
      article.slug,
      article.title,
      article.excerpt,
      article.body_markdown,
      article.tags,
      cover,
      article.seo_title,
      article.seo_description,
    ],
  );
  await db.query(
    "select * from public.blog_publish($1,$2,3,$3,$4,'Vishal Jadeja')",
    [
      postId,
      owner,
      [cover, diagram],
      Math.max(1, Math.ceil(article.body_markdown.split(/\s+/).length / 220)),
    ],
  );
  console.log(
    "Local sample article ready: /blog/building-a-quieter-place-to-write",
  );
}
