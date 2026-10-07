import "./blog-load-env.mts";
import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret)
  throw new Error("Set the blog Supabase environment before backup.");
const argument = process.argv.indexOf("--output");
const output = resolve(
  argument >= 0
    ? process.argv[argument + 1]
    : `blog-backups/${new Date().toISOString().replace(/[:.]/g, "-")}`,
);
await mkdir(output, { recursive: true, mode: 0o700 });
const client = createClient(url, secret, { auth: { persistSession: false } });
async function rows(table: string) {
  const all: Record<string, unknown>[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .order(
        table === "blog_publications"
          ? "post_id"
          : table === "blog_publication_media"
            ? "media_id"
            : "id",
      )
      .range(offset, offset + 499);
    if (error) throw new Error(`Backup failed for ${table}: ${error.message}`);
    all.push(...data);
    if (data.length < 500) break;
  }
  return all;
}
const [drafts, publications, media, links] = await Promise.all([
  rows("blog_posts"),
  rows("blog_publications"),
  rows("blog_media"),
  rows("blog_publication_media"),
]);
await writeFile(
  join(output, "content.json"),
  JSON.stringify(
    {
      format: "portfolio-blog-backup-v1",
      exported_at: new Date().toISOString(),
      drafts,
      publications,
      media,
      links,
    },
    null,
    2,
  ),
  { mode: 0o600 },
);
let failures = 0;
for (const asset of media) {
  for (const [bucket, path] of [
    ["blog-drafts", asset.private_object_path],
    ["blog-drafts", `${asset.private_object_path}.webp`],
    ["blog-public", asset.public_object_path],
  ]) {
    if (!path || typeof path !== "string") continue;
    const { data, error } = await client.storage
      .from(String(bucket))
      .download(path);
    if (error || !data) {
      if (asset.state === "pending" || asset.state === "failed") continue;
      failures += 1;
      console.error(
        `Missing asset ${asset.id} (${bucket}); backup is incomplete.`,
      );
      continue;
    }
    const destination = join(output, "assets", String(bucket), path);
    await mkdir(resolve(destination, ".."), { recursive: true, mode: 0o700 });
    await writeFile(destination, Buffer.from(await data.arrayBuffer()), {
      mode: 0o600,
    });
  }
}
console.log(
  `Exported ${drafts.length} drafts and ${publications.length} publications to ${output}.`,
);
if (failures) {
  process.exitCode = 1;
  throw new Error(
    `${failures} assets were missing; do not treat this as a complete backup.`,
  );
}
