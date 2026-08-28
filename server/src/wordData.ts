import chaptersData from './data/chapters.json';
import pagesData from './data/pages.json';
import { RoundSource } from './types';

type WordEntry = { num: number; words: string[] };

export const CHAPTER_COUNT = (chaptersData as WordEntry[]).length;
export const PAGE_COUNT = (pagesData as WordEntry[]).length;

// Flip to 'chapter' to roll whole-chapter rounds instead of pages —
// mirrors mobile/src/state/types.ts's ROUND_SOURCE_MODE.
export const ROUND_SOURCE_MODE: 'chapter' | 'pages' = 'pages';

function pickDistinctPages(count: number): number[] {
  const n = Math.min(Math.max(1, count), PAGE_COUNT);
  const nums = new Set<number>();
  while (nums.size < n) {
    nums.add(Math.floor(Math.random() * PAGE_COUNT) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

export function pickRoundSource(pagesPerRound: number): RoundSource {
  if (ROUND_SOURCE_MODE === 'chapter') {
    return { type: 'chapter', num: Math.floor(Math.random() * CHAPTER_COUNT) + 1 };
  }
  return { type: 'pages', nums: pickDistinctPages(pagesPerRound) };
}

export function getWordsForSource(source: RoundSource): Set<string> {
  if (source.type === 'chapter') {
    const entry = (chaptersData as WordEntry[]).find((c) => c.num === source.num);
    return new Set(entry ? entry.words : []);
  }
  const set = new Set<string>();
  (pagesData as WordEntry[]).forEach((pg) => {
    if (source.nums.includes(pg.num)) pg.words.forEach((w) => set.add(w));
  });
  return set;
}

const WORD_RE = /[A-Za-z]+(?:['’-][A-Za-z]+)*/g;

/** Server-side validation, mirroring mobile/src/utils/wordCheck.ts — never trust the client alone. */
export function textUsesOnlyAllowedWords(text: string, allowed: Set<string>): boolean {
  const matches = text.match(WORD_RE);
  if (!matches) return true;
  return matches.every((raw) => {
    const norm = raw.toLowerCase().replace(/’/g, "'").replace(/^['-]+|['-]+$/g, '');
    return norm.length === 0 || allowed.has(norm);
  });
}
