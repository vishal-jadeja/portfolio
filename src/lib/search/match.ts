import type { SearchEntry } from "./types";

type Field = { words: string[]; text: string; compact: string; weight: number };
export type PreparedEntry = { entry: SearchEntry; title: string; fields: Field[] };

const WEIGHTS = { title: 3, keywords: 2, subtitle: 1, body: 0.5 };

/** Lowercase, strip accents and punctuation so "Next.js" matches "next js". */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9+#]+/g, " ")
    .trim();
}

function field(value: string, weight: number): Field {
  const text = normalize(value);
  return { words: text.split(" ").filter(Boolean), text, compact: text.replace(/ /g, ""), weight };
}

/** Normalize once so each keystroke only scores, never re-tokenizes. */
export function prepare(entries: SearchEntry[]): PreparedEntry[] {
  return entries.map((entry) => ({
    entry,
    title: normalize(entry.title),
    fields: [
      field(entry.title, WEIGHTS.title),
      field(entry.keywords?.join(" ") ?? "", WEIGHTS.keywords),
      field(entry.subtitle ?? "", WEIGHTS.subtitle),
      field(entry.body ?? "", WEIGHTS.body),
    ].filter((f) => f.text),
  }));
}

/**
 * Edit distance between `token` and the closest prefix of `word`, so a typo
 * while still typing ("websok") matches "websockets".
 */
export function prefixDistance(token: string, word: string) {
  let prev = Array.from({ length: word.length + 1 }, (_, j) => j);
  for (let i = 1; i <= token.length; i++) {
    const row = [i];
    for (let j = 1; j <= word.length; j++)
      row[j] = Math.min(
        prev[j] + 1,
        row[j - 1] + 1,
        prev[j - 1] + (token[i - 1] === word[j - 1] ? 0 : 1),
      );
    prev = row;
  }
  return Math.min(...prev);
}

function tokenScore(token: string, f: Field) {
  if (f.words.includes(token)) return 1;
  // A single letter is too little signal to prefix-match descriptions.
  if ((token.length > 1 || f.weight >= WEIGHTS.keywords) && f.words.some((w) => w.startsWith(token)))
    return 0.8;
  if (token.length >= 3 && (f.text.includes(token) || f.compact.includes(token))) return 0.6;
  // Typo tolerance only on titles and keywords; long prose yields false hits.
  if (token.length < 4 || f.weight < WEIGHTS.keywords) return 0;
  const allowed = token.length >= 8 ? 2 : 1;
  let best = Infinity;
  for (const w of f.words) best = Math.min(best, prefixDistance(token, w));
  return best <= allowed ? 0.45 - 0.15 * (best - 1) : 0;
}

/** Every query token must match somewhere; better and earlier fields win. */
export function search(prepared: PreparedEntry[], query: string, limit = 30) {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ");
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const p of prepared) {
    let score = 0;
    for (const token of tokens) {
      let best = 0;
      for (const f of p.fields) best = Math.max(best, f.weight * tokenScore(token, f));
      if (!best) {
        score = 0;
        break;
      }
      score += best;
    }
    if (!score) continue;
    if (p.title === q) score += 3;
    else if (p.title.startsWith(q)) score += 1.5;
    scored.push({ entry: p.entry, score });
  }
  // Array.prototype.sort is stable, so ties keep the index's curated order.
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry);
}

/**
 * [start, end) ranges of `text` to highlight for `query`: word prefixes, plus
 * mid-word hits for 3+ letter tokens, mirroring how tokenScore matches.
 * Folds each character on its own so offsets map back to the original text.
 */
export function highlightRanges(text: string, query: string): [number, number][] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (!tokens.length) return [];
  const ranges: [number, number][] = [];
  for (const m of text.matchAll(/[\p{L}\p{N}+#]+/gu)) {
    let folded = "";
    const origin: number[] = [];
    for (let i = 0; i < m[0].length; i++)
      for (const c of normalize(m[0][i])) {
        folded += c;
        origin.push(i);
      }
    let best: [number, number] | null = null;
    for (const t of tokens) {
      const at = folded.startsWith(t) ? 0 : t.length >= 3 ? folded.indexOf(t) : -1;
      if (at < 0 || (best && best[1] - best[0] >= t.length)) continue;
      best = [at, at + t.length];
    }
    if (best) ranges.push([m.index + origin[best[0]], m.index + origin[best[1] - 1] + 1]);
  }
  return ranges;
}

/** A short excerpt of `text` around its first match, or null if it has none. */
export function matchSnippet(text: string, query: string, before = 32, after = 80) {
  const first = highlightRanges(text, query)[0];
  if (!first) return null;
  // Start on a word boundary so the excerpt doesn't open mid-word.
  let start = Math.max(0, first[0] - before);
  if (start > 0) start = text.indexOf(" ", start) + 1 || first[0];
  if (start > first[0]) start = first[0];
  let end = Math.min(text.length, first[1] + after);
  // Likewise end on one, unless that would cut into the match itself.
  if (end < text.length && /\S/.test(text[end])) end = Math.max(first[1], text.lastIndexOf(" ", end));
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}
