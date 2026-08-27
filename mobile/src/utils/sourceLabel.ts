import { RoundSource } from '../state/types';

export function formatSourceLabel(source: RoundSource): string {
  if (source.type === 'chapter') {
    return `CHAPTER ${source.num} WORDS ONLY`;
  }
  const range = source.start === source.end ? `PAGE ${source.start}` : `PAGES ${source.start}–${source.end}`;
  return `${range} WORDS ONLY`;
}
