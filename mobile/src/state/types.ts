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

export interface GameState {
  phase: Phase;
  players: Player[];
  round: number;
  usedPromptIndices: number[];
  currentPrompt: string | null;
  currentChapter: number | null;
  turnOrder: string[]; // player ids, order for answering this round
  turnIndex: number;
  answers: Answer[];
  revealOrder: string[]; // shuffled player ids, order answers are displayed
  voteTurnIndex: number;
  votes: Vote[];
  lastRoundPoints: Record<string, number>; // playerId -> points earned last round
}

export const TOTAL_ROUNDS_DEFAULT = 5;
