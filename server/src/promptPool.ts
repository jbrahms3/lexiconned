import { PROMPTS } from './data/prompts';
import { SPICY_PROMPTS } from './data/spicyPrompts';
import { PromptMode } from './types';

export function promptPool(mode: PromptMode): string[] {
  return mode === 'spicy' ? SPICY_PROMPTS : PROMPTS;
}

export function pickPrompt(mode: PromptMode, used: number[]): { text: string; used: number[] } {
  const prompts = promptPool(mode);
  let pool = prompts.map((_, i) => i).filter((i) => !used.includes(i));
  let nextUsed = used;
  if (pool.length === 0) {
    pool = prompts.map((_, i) => i);
    nextUsed = [];
  }
  const index = pool[Math.floor(Math.random() * pool.length)];
  return { text: prompts[index], used: [...nextUsed, index] };
}
