import "./load-env.mts";

// ---------------------------------------------------------------------------
// Purge every vector belonging to a knowledge source that no longer exists on
// disk. `ingest.mts` only deletes chunks for files it can still see, so a
// renamed or deleted .mdx leaves its old vectors stranded in the index forever.
//
//   npx tsx scripts/purge-source.mts mintmark
//   npx tsx scripts/purge-source.mts mintmark --dry-run
//
// Takes the file slug (basename without extension), matching the chunk id
// format `${slug}-chunk-${i}`.
// ---------------------------------------------------------------------------

const { listIds, deleteByIds, deleteBySource } = await import(
  "@/lib/rag/pinecone-client"
);

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const slug = args.find((a) => !a.startsWith("--"));

  if (!slug) {
    console.error("✗ Usage: npx tsx scripts/purge-source.mts <slug> [--dry-run]");
    process.exit(1);
  }

  const prefix = `${slug}-chunk-`;
  console.log(`⟳ Looking for vectors with id prefix "${prefix}"...`);

  let ids: string[];
  try {
    ids = await listIds(prefix);
  } catch (err) {
    // listPaginated is serverless-only. On a pod-based index, fall back to the
    // metadata-filter delete, which is pod-only.
    console.warn(
      `⚠ Could not list ids (${(err as Error).message}). Falling back to metadata-filter delete.`
    );
    if (dryRun) {
      console.log("· Dry run — skipping fallback delete.");
      return;
    }
    await deleteBySource(`${slug}.mdx`);
    console.log(`✓ Purge requested for source: ${slug}.mdx`);
    return;
  }

  if (ids.length === 0) {
    console.log(`✓ Nothing to purge — no vectors match "${prefix}".`);
    return;
  }

  console.log(`  Found ${ids.length} vectors:`);
  for (const id of ids) console.log(`    · ${id}`);

  if (dryRun) {
    console.log("\n· Dry run — nothing deleted.");
    return;
  }

  await deleteByIds(ids);
  console.log(`\n✓ Purged ${ids.length} vectors for "${slug}".`);
}

main().catch((err) => {
  console.error("✗ Purge failed:", err);
  process.exit(1);
});
