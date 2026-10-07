import "./blog-load-env.mts";
import { createClient } from "@supabase/supabase-js";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret)
  throw new Error("Set the blog Supabase environment before cleanup.");
const client = createClient(url, secret, { auth: { persistSession: false } });
const cutoff = new Date(Date.now() - 7 * 86400_000).toISOString();
const { data, error } = await client
  .from("blog_media")
  .select("id,post_id,state")
  .in("state", ["pending", "failed"])
  .lt("created_at", cutoff)
  .limit(500);
if (error) throw new Error(error.message);
console.log(
  `Found ${data.length} expired failed/pending reservations (maximum 500 per run).`,
);
console.table(data);
if (!process.argv.includes("--apply")) {
  console.log("Preview only. Run with --apply after reviewing.");
  process.exit(0);
}
const { data: claimed, error: claimError } = await client.rpc(
  "blog_claim_expired_uploads",
  { p_ids: data.map((m) => m.id) },
);
if (claimError) throw new Error(claimError.message);
let failures = 0;
for (const media of claimed) {
  const { error: privateError } = await client.storage
    .from("blog-drafts")
    .remove([media.private_object_path, `${media.private_object_path}.webp`]);
  const { error: publicError } = media.public_object_path
    ? await client.storage
        .from("blog-public")
        .remove([media.public_object_path])
    : { error: null };
  if (privateError || publicError) {
    console.error(
      `Storage cleanup failed for ${media.id}; retained for retry.`,
    );
    failures += 1;
    continue;
  }
  const { error: deleteError } = await client
    .from("blog_media")
    .delete()
    .eq("id", media.id)
    .eq("state", "failed");
  if (deleteError) {
    console.error(`Metadata cleanup failed for ${media.id}.`);
    failures += 1;
  }
}
console.log(`Processed ${claimed.length} unreferenced expired reservations.`);
if (failures) process.exitCode = 1;
