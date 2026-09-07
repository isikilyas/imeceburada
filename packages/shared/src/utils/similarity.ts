/** Trims, collapses whitespace, and locale-lowercases (tr-TR) so "İ"/"I" case rules match user intent. */
export function normalizeForMatch(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr-TR");
}

function bigrams(normalized: string): string[] {
  if (normalized.length < 2) return normalized.length === 0 ? [] : [normalized];
  const grams: string[] = [];
  for (let i = 0; i < normalized.length - 1; i++) grams.push(normalized.slice(i, i + 2));
  return grams;
}

/**
 * Dice coefficient over character bigrams — 0 (no similarity) to 1 (identical after
 * normalization). Used to power "did you mean X?" suggestions against both the static
 * taxonomy constants and community-approved/company-name candidates fetched from the DB.
 */
export function stringSimilarity(a: string, b: string): number {
  const normA = normalizeForMatch(a);
  const normB = normalizeForMatch(b);
  if (normA === normB) return 1;

  const gramsA = bigrams(normA);
  const gramsB = bigrams(normB);
  if (gramsA.length === 0 || gramsB.length === 0) return 0;

  const counts = new Map<string, number>();
  for (const g of gramsA) counts.set(g, (counts.get(g) ?? 0) + 1);

  let matches = 0;
  for (const g of gramsB) {
    const remaining = counts.get(g) ?? 0;
    if (remaining > 0) {
      matches++;
      counts.set(g, remaining - 1);
    }
  }
  return (2 * matches) / (gramsA.length + gramsB.length);
}
