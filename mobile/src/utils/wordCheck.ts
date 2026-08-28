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

const WORD_CHAR_RE = /[A-Za-z'’-]/;

/**
 * Finds the word being typed immediately before `cursor` (its start index
 * and lowercase prefix so far), for live autosuggest as the user types.
 */
export function currentWordPrefix(text: string, cursor: number): { start: number; prefix: string } {
  let start = Math.max(0, Math.min(cursor, text.length));
  while (start > 0 && WORD_CHAR_RE.test(text[start - 1])) start--;
  const prefix = normalizeWord(text.slice(start, cursor));
  return { start, prefix };
}

/** Up to `limit` allowed words starting with `prefix`, shortest first. */
export function suggestWords(prefix: string, allowedWords: readonly string[], limit = 8): string[] {
  if (!prefix) return [];
  const matches: string[] = [];
  for (let i = 0; i < allowedWords.length; i++) {
    if (allowedWords[i].startsWith(prefix)) matches.push(allowedWords[i]);
  }
  matches.sort((a, b) => a.length - b.length || a.localeCompare(b));
  return matches.slice(0, limit);
}
