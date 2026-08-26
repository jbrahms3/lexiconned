/**
 * Tokenizing and validating text against a chapter's allowed word set.
 * Mirrors the logic used in the companion web app (Longbourn Lexicon).
 */

const WORD_RE = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g;

export function tokenize(text: string): string[] {
  const matches = text.match(WORD_RE);
  if (!matches) return [];
  return matches;
}

export function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/^['-]+|['-]+$/g, '');
}

export interface CheckResult {
  totalWords: number;
  flaggedWords: string[]; // unique, normalized, lowercase
}

export function checkText(text: string, allowedWords: ReadonlySet<string>): CheckResult {
  const tokens = tokenize(text);
  const flaggedSet = new Set<string>();
  tokens.forEach((raw) => {
    const norm = normalizeWord(raw);
    if (norm.length > 0 && !allowedWords.has(norm)) {
      flaggedSet.add(norm);
    }
  });
  return { totalWords: tokens.length, flaggedWords: Array.from(flaggedSet).sort() };
}
