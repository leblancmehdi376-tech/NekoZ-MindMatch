/** Lowercase, strip accents/diacritics, strip punctuation, collapse whitespace. */
export function normalizeAnswer(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents (combining diacritical marks)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // strip punctuation/emoji
    .trim()
    .replace(/\s+/g, ' ');
}

/** Classic edit distance, used to suggest merges for near-identical answers. */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const prev = new Array(b.length + 1);
  const curr = new Array(b.length + 1);

  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j++) prev[j] = curr[j];
  }

  return prev[b.length];
}

/** Two distinct normalized answers are "close enough" to suggest a manual merge. */
export function isCloseMatch(a: string, b: string): boolean {
  if (a === b || a.length === 0 || b.length === 0) return false;
  const distance = levenshtein(a, b);
  const threshold = Math.max(1, Math.floor(Math.max(a.length, b.length) / 4));
  return distance <= threshold;
}
