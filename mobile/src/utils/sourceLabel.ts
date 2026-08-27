import { RoundSource } from '../state/types';

export function formatSourceLabel(source: RoundSource): string {
  if (source.type === 'chapter') {
    return `CHAPTER ${source.num} WORDS ONLY`;
  }
  const nums = source.nums;
  let range: string;
  if (nums.length === 1) {
    range = `PAGE ${nums[0]}`;
  } else if (nums.length === 2) {
    range = `PAGES ${nums[0]} & ${nums[1]}`;
  } else {
    range = `PAGES ${nums.slice(0, -1).join(', ')} & ${nums[nums.length - 1]}`;
  }
  return `${range} WORDS ONLY`;
}
