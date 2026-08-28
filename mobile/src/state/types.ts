export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Answer {
  playerId: string;
  text: string;
  source: RoundSource; // the vocabulary source this particular answer was written against
}

export interface Vote {
  voterId: string;
  votedForPlayerId: string; // author of the answer voted for
}

export type Phase =
  | 'players'
  | 'rolling'
  | 'pass-answer'
  | 'answer'
  | 'reveal'
  | 'pass-vote'
  | 'vote'
  | 'results'
  | 'final';

/**
 * The vocabulary source for a round: either one chapter, or a set of pages
 * (not necessarily adjacent — each is picked independently). "Page" here is
 * an approximation (~275-word chunks of the running text, not real
 * printed-edition page numbers) — see build/build-data.js in the web app's
 * repo for how they're generated.
 */
export type RoundSource =
  | { type: 'chapter'; num: number }
  | { type: 'pages'; nums: number[] };

export type PromptMode = 'classic' | 'spicy';

/**
 * 'shared' — one roll per round, every player writes against the same
 * source. 'perPlayer' — a fresh roll happens right before each player's
 * turn, so everyone answers against their own pages.
 */
export type SourceMode = 'shared' | 'perPlayer';

export interface GameState {
  phase: Phase;
  players: Player[];
  round: number;
  promptMode: PromptMode; // set on the players screen, before rolling starts
  sourceMode: SourceMode; // set on the players screen, before rolling starts
  usedPromptIndices: number[];
  currentPrompt: string | null;
  currentSource: RoundSource | null; // the source for whoever is currently rolling/answering
  pagesPerRound: 1 | 2; // set on the players screen, before rolling starts
  turnOrder: string[]; // player ids, order for answering this round
  turnIndex: number;
  answers: Answer[];
  revealOrder: string[]; // shuffled player ids, order answers are displayed
  voteTurnIndex: number;
  votes: Vote[];
  lastRoundPoints: Record<string, number>; // playerId -> points earned last round
}

export const TOTAL_ROUNDS_DEFAULT = 5;

// Which round unit new rounds use. Flip to 'chapter' to go back to
// whole-chapter rounds (pagesPerRound has no effect in that mode).
export const ROUND_SOURCE_MODE: 'chapter' | 'pages' = 'pages';
// Default for GameState.pagesPerRound, used until the players screen toggle changes it.
export const DEFAULT_PAGES_PER_ROUND: 1 | 2 = 2;
// Default for GameState.promptMode, used until the players screen toggle changes it.
export const DEFAULT_PROMPT_MODE: PromptMode = 'classic';
// Default for GameState.sourceMode, used until the players screen toggle changes it.
export const DEFAULT_SOURCE_MODE: SourceMode = 'shared';
