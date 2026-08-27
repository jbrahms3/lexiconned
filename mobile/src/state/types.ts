export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Answer {
  playerId: string;
  text: string;
}

export interface Vote {
  voterId: string;
  votedForPlayerId: string; // author of the answer voted for
}

export type Phase =
  | 'players'
  | 'pass-answer'
  | 'answer'
  | 'reveal'
  | 'pass-vote'
  | 'vote'
  | 'results'
  | 'final';

/**
 * The vocabulary source for a round: either one chapter, or a page range.
 * "Page" here is an approximation (~275-word chunks of the running text,
 * not real printed-edition page numbers) — see build/build-data.js in the
 * web app's repo for how they're generated.
 */
export type RoundSource =
  | { type: 'chapter'; num: number }
  | { type: 'pages'; start: number; end: number };

export interface GameState {
  phase: Phase;
  players: Player[];
  round: number;
  usedPromptIndices: number[];
  currentPrompt: string | null;
  currentSource: RoundSource | null;
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
// whole-chapter rounds.
export const ROUND_SOURCE_MODE: 'chapter' | 'pages' = 'pages';
// How many pages make up one round's vocabulary when ROUND_SOURCE_MODE is 'pages'.
export const PAGES_PER_ROUND = 2;
