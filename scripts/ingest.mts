import "./load-env.mts";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { VectorChunk, ChunkMetadata } from "@/lib/rag/pinecone-client";

const { embedBatch } = await import("@/lib/rag/embedder");
const { deleteBySource, upsertChunks, listIds, deleteByIds, slugFromChunkId } =
  await import("@/lib/rag/pinecone-client");

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const KNOWLEDGE_DIR = path.resolve("src/knowledge");
const MAX_CHUNK_CHARS = 600;
const MIN_CHUNK_CHARS = 80;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FileResult {
  filename: string;
  chunks: number;
  totalChars: number;
  status: "done" | "failed";
  error?: string;
}

// ---------------------------------------------------------------------------
// Chunking
// ---------------------------------------------------------------------------

function getFirstSentence(text: string): string {
  const match = text.match(/[^.!?\n]*[.!?]/);
  return match ? match[0].trim() : text.split("\n")[0].trim();
}

function chunkContent(content: string): string[] {
  // 1. Split on H2 section boundaries
  const rawSections = content.split("\n## ");
  const sections = rawSections
    .map((s, i) => (i === 0 ? s : `## ${s}`).trim())
    .filter((s) => s.length > 0);

  // 2. Sub-split large sections on paragraph breaks
  const raw: string[] = [];
  for (const section of sections) {
    if (section.length <= MAX_CHUNK_CHARS) {
      raw.push(section);
    } else {
      const paras = section
        .split("\n\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      raw.push(...paras);
    }
  }

  // 3. Merge undersized chunks into the previous one
  const merged: string[] = [];
  for (const chunk of raw) {
    if (chunk.length < MIN_CHUNK_CHARS && merged.length > 0) {
      merged[merged.length - 1] += "\n\n" + chunk;
    } else {
      merged.push(chunk);
    }
  }

  // 4. Overlap: append first sentence of next chunk to each chunk
  return merged.map((chunk, i) => {
    if (i < merged.length - 1) {
      const firstSentence = getFirstSentence(merged[i + 1]);
      if (firstSentence) return `${chunk}\n\n${firstSentence}`;
    }
    return chunk;
  });
}

// ---------------------------------------------------------------------------
// Per-file processing
// ---------------------------------------------------------------------------

async function processFile(filePath: string): Promise<FileResult> {
  const filename = path.basename(filePath);
  const slug = path.basename(filePath, path.extname(filePath));

  process.stdout.write(`⟳ Processing ${filename}...\n`);

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  const texts = chunkContent(content);
  const totalChars = texts.reduce((sum, t) => sum + t.length, 0);

  const vectors = await embedBatch(texts);

  const chunks: VectorChunk[] = texts.map((text, i) => {
    const metadata: ChunkMetadata = {
      text,
      source_file: filename,
      category: (frontmatter.category as string) ?? "general",
      tags: Array.isArray(frontmatter.tags) ? (frontmatter.tags as string[]) : [],
      chunk_index: i,
      char_count: text.length,
    };
    return {
      id: `${slug}-chunk-${i}`,
      values: vectors[i],
      metadata,
    };
  });

  await deleteBySource(filename);
  await upsertChunks(chunks);

  process.stdout.write(
    `✓ ${filename} → ${chunks.length} chunks, ~${totalChars} chars embedded\n`
  );

  return { filename, chunks: chunks.length, totalChars, status: "done" };
}

// ---------------------------------------------------------------------------
// Orphan sweep
// ---------------------------------------------------------------------------

/**
 * Delete vectors whose source file no longer exists on disk.
 *
 * `processFile` only calls `deleteBySource` for files it can still see, so a
 * renamed or deleted .mdx would otherwise leave its chunks in the index
 * forever — and the bot would keep retrieving them.
 */
async function sweepOrphans(
  liveSlugs: Set<string>,
  dryRun: boolean
): Promise<void> {
  let ids: string[];
  try {
    ids = await listIds();
  } catch (err) {
    // listPaginated is serverless-only; on a pod-based index we can't enumerate.
    console.warn(
      `\n⚠ Orphan sweep skipped — could not list index ids (${(err as Error).message}).`
    );
    console.warn(
      "  On a pod-based index, purge stale sources manually with scripts/purge-source.mts."
    );
    return;
  }

  const orphans = ids.filter((id) => {
    const slug = slugFromChunkId(id);
    return slug !== null && !liveSlugs.has(slug);
  });

  if (orphans.length === 0) {
    console.log("\n✓ Orphan sweep: no stale vectors found.");
    return;
  }

  const orphanSlugs = [...new Set(orphans.map(slugFromChunkId))];
  console.log(
    `\n⟳ Orphan sweep: ${orphans.length} vectors from ${orphanSlugs.length} removed source(s): ${orphanSlugs.join(", ")}`
  );

  if (dryRun) {
    console.log("· Dry run — nothing deleted.");
    return;
  }

  await deleteByIds(orphans);
  console.log(`✓ Orphan sweep: purged ${orphans.length} stale vectors.`);
}

// ---------------------------------------------------------------------------
// Summary table
// ---------------------------------------------------------------------------

function printSummaryTable(results: FileResult[], elapsedMs: number): void {
  const COL1 = Math.max(16, ...results.map((r) => r.filename.length)) + 2;
  const COL2 = 8;

  console.log("\n");
  console.log(`${"File".padEnd(COL1)}| ${"Chunks".padEnd(COL2)}| Status`);
  console.log("-".repeat(COL1 + COL2 + 20));

  for (const r of results) {
    const statusStr =
      r.status === "done" ? "✓ done" : `✗ failed (${r.error ?? "unknown"})`;
    console.log(
      `${r.filename.padEnd(COL1)}| ${String(r.chunks).padEnd(COL2)}| ${statusStr}`
    );
  }

  const total = results.length;
  const failed = results.filter((r) => r.status === "failed").length;
  console.log(
    `\n${total - failed}/${total} files succeeded · ${(elapsedMs / 1000).toFixed(2)}s`
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Parse --file flag
  const fileArgIdx = process.argv.indexOf("--file");
  const targetFile = fileArgIdx !== -1 ? process.argv[fileArgIdx + 1] : null;
  const noSweep = process.argv.includes("--no-sweep");
  const sweepDryRun = process.argv.includes("--sweep-dry-run");

  let filePaths: string[];

  if (targetFile) {
    const resolved = path.resolve(KNOWLEDGE_DIR, targetFile);
    if (!fs.existsSync(resolved)) {
      console.error(`✗ File not found: ${resolved}`);
      process.exit(1);
    }
    filePaths = [resolved];
  } else {
    const entries = fs.readdirSync(KNOWLEDGE_DIR, {
      recursive: true,
      encoding: "utf-8",
    });
    filePaths = entries
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => path.join(KNOWLEDGE_DIR, f));
  }

  if (filePaths.length === 0) {
    console.error("No .mdx files found in src/knowledge/");
    process.exit(1);
  }

  console.log(`\nIngesting ${filePaths.length} file(s) from src/knowledge/\n`);

  const startTime = Date.now();
  const results: FileResult[] = [];

  for (const filePath of filePaths) {
    try {
      const result = await processFile(filePath);
      results.push(result);
    } catch (err) {
      const filename = path.basename(filePath);
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`✗ ${filename} failed: ${errorMsg}`);
      results.push({
        filename,
        chunks: 0,
        totalChars: 0,
        status: "failed",
        error: errorMsg,
      });
    }
  }

  printSummaryTable(results, Date.now() - startTime);

  // A targeted --file run only knows about one file, so sweeping there would be
  // surprising. Sweep on full ingests only.
  if (targetFile) {
    console.log(
      "\n· Orphan sweep skipped (--file run). Run a full ingest to sweep."
    );
  } else if (noSweep) {
    console.log("\n· Orphan sweep skipped (--no-sweep).");
  } else {
    const liveSlugs = new Set(
      fs
        .readdirSync(KNOWLEDGE_DIR, { recursive: true, encoding: "utf-8" })
        .filter((f) => f.endsWith(".mdx"))
        .map((f) => path.basename(f, ".mdx"))
    );
    await sweepOrphans(liveSlugs, sweepDryRun);
  }
}

main().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
