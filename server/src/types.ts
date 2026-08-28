/**
 * Shared shapes for Lexiconned Party's networked (online) mode. This file
 * is intentionally duplicated (not imported) on the mobile client at
 * mobile/src/state/networkTypes.ts — there's no shared package between the
 * two, so keep the two in sync by hand when either changes.
 */

export type RoundSource =
  | { type: 'chapter'; num: number }
  | { type: 'pages'; nums: number[] };

export type PromptMode = 'classic' | 'spicy';
export type SourceMode = 'shared' | 'perPlayer';

export type RoomPhase =
  | 'lobby'
  | 'rolling'
  | 'answering'
  | 'reveal'
  | 'voting'
  | 'results'
  | 'final';

export interface NetworkPlayer {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}

export interface NetworkAnswer {
  playerId: string;
  text: string;
  source: RoundSource;
}

export interface NetworkVote {
  voterId: string;
  votedForPlayerId: string;
}

export interface RoomState {
  code: string;
  hostId: string;
  players: NetworkPlayer[];
  phase: RoomPhase;
  round: number;
  promptMode: PromptMode;
  sourceMode: SourceMode;
  pagesPerRound: 1 | 2;
  usedPromptIndices: number[];
  currentPrompt: string | null;
  currentSource: RoundSource | null; // used when sourceMode === 'shared'
  playerSources: Record<string, RoundSource>; // used when sourceMode === 'perPlayer'
  answers: NetworkAnswer[];
  revealOrder: string[];
  votes: NetworkVote[];
  lastRoundPoints: Record<string, number>;
}

// ---- Wire protocol -------------------------------------------------------

export type ClientMessage =
  | { type: 'CREATE_ROOM'; hostName: string }
  | { type: 'JOIN_ROOM'; code: string; playerName: string }
  | { type: 'REJOIN_ROOM'; code: string; playerId: string }
  | { type: 'SET_PAGES_PER_ROUND'; count: 1 | 2 }
  | { type: 'SET_PROMPT_MODE'; mode: PromptMode }
  | { type: 'SET_SOURCE_MODE'; mode: SourceMode }
  | { type: 'START_GAME' }
  | { type: 'SUBMIT_ANSWER'; text: string }
  | { type: 'START_VOTING' }
  | { type: 'SUBMIT_VOTE'; votedForPlayerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'LEAVE_ROOM' };

export type ServerMessage =
  | { type: 'JOINED'; code: string; playerId: string; state: RoomState }
  | { type: 'STATE'; state: RoomState }
  | { type: 'ERROR'; message: string };
