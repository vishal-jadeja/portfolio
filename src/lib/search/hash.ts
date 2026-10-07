/** Element id from a URL hash. A malformed escape (e.g. "#%") must not throw. */
export function hashId(hash: string) {
  const raw = hash.replace(/^#/, "");
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
