import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "@/lib/config/env";
import type { RetrievedChunk } from "./types";

export interface ChunkMetadata {
  text: string;
  source_file: string;
  category: string;
  tags: string[];
  chunk_index: number;
  char_count: number;
  [key: string]: string | number | boolean | string[];
}

export interface VectorChunk {
  id: string;
  values: number[];
  metadata: ChunkMetadata;
}

let _client: Pinecone | null = null;

function getClient(): Pinecone {
  if (!_client) {
    _client = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  }
  return _client;
}

const UPSERT_BATCH_SIZE = 100;

export function getIndex() {
  return getClient().Index({ name: env.PINECONE_INDEX_NAME });
}

export async function upsertChunks(chunks: VectorChunk[]): Promise<void> {
  const index = getIndex();

  for (let i = 0; i < chunks.length; i += UPSERT_BATCH_SIZE) {
    const batch = chunks.slice(i, i + UPSERT_BATCH_SIZE);
    const batchNum = Math.floor(i / UPSERT_BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / UPSERT_BATCH_SIZE);

    console.log(
      `[pinecone] Upserting batch ${batchNum}/${totalBatches} (${batch.length} vectors)`
    );

    await index.upsert({ records: batch });
  }
}

export async function queryChunks(
  embedding: number[],
  topK = 5,
  minScore = 0.35
): Promise<RetrievedChunk[]> {
  const index = getIndex();

  const response = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  const allMatches = response.matches ?? [];
  console.log("[pinecone] raw scores:", allMatches.map((m) => m.score?.toFixed(3)));

  return allMatches
    .filter((match) => (match.score ?? 0) >= minScore)
    .map((match) => {
      const meta = match.metadata as unknown as ChunkMetadata;
      return {
        text: meta?.text,
        source_file: meta?.source_file,
        score: match.score ?? 0,
      };
    });
}

export async function deleteBySource(sourceFile: string): Promise<void> {
  const index = getIndex();

  try {
    await index.deleteMany({ filter: { source_file: { $eq: sourceFile } } });
    console.log(`[pinecone] Deleted chunks for source: ${sourceFile}`);
  } catch (err) {
    // PineconeNotFoundError (404) is expected when the index is empty or no matching vectors exist
    if ((err as Error)?.name !== "PineconeNotFoundError") throw err;
  }
}

const DELETE_BATCH_SIZE = 1000;

/**
 * List every vector id in the index, optionally narrowed to an id prefix.
 *
 * Chunk ids are deterministic (`${slug}-chunk-${i}`), so a prefix of
 * `"mintmark-chunk-"` returns exactly that file's chunks.
 *
 * Note: `listPaginated` is supported only on serverless indexes. On a pod-based
 * index this throws, and callers should fall back to `deleteBySource`, which
 * uses a metadata filter (pod-only — the two APIs are mutually exclusive).
 */
export async function listIds(prefix?: string): Promise<string[]> {
  const index = getIndex();
  const ids: string[] = [];
  let paginationToken: string | undefined;

  do {
    const res = await index.listPaginated({ prefix, paginationToken });
    for (const vector of res.vectors ?? []) {
      if (vector.id) ids.push(vector.id);
    }
    paginationToken = res.pagination?.next;
  } while (paginationToken);

  return ids;
}

/** Delete vectors by explicit id. Works on both serverless and pod indexes. */
export async function deleteByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const index = getIndex();

  for (let i = 0; i < ids.length; i += DELETE_BATCH_SIZE) {
    const batch = ids.slice(i, i + DELETE_BATCH_SIZE);
    await index.deleteMany({ ids: batch });
    console.log(`[pinecone] Deleted ${batch.length} vectors by id`);
  }
}

/** Derive the source slug from a chunk id (`cadenz-chunk-3` → `cadenz`). */
export function slugFromChunkId(id: string): string | null {
  const idx = id.lastIndexOf("-chunk-");
  return idx === -1 ? null : id.slice(0, idx);
}
