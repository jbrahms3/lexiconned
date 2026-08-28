/**
 * Wire types for Online mode (everyone on their own phone, joined by a
 * room code) — talks to the server in ../../../server. Mirrors
 * server/src/types.ts; there's no shared package between the two repos,
 * so keep this file in sync by hand when the server's types change.
 *
 * RoundSource / PromptMode / SourceMode are reused as-is from
 * ./types since they're identical in shape to the server's copies.
 */
import { RoundSource, PromptMode, SourceMode } from './types';

export type { RoundSource, PromptMode, SourceMode };

export type RoomPhase = 'lobby' | 'rolling' | 'answering' | 'reveal' | 'voting' | 'results' | 'final';

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
  currentSource: RoundSource | null;
  playerSources: Record<string, RoundSource>;
  answers: NetworkAnswer[];
  revealOrder: string[];
  votes: NetworkVote[];
  lastRoundPoints: Record<string, number>;
}

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

/** Source for whoever is currently answering, given the round's source mode. */
export function sourceForPlayer(state: RoomState, playerId: string): RoundSource | null {
  if (state.sourceMode === 'shared') return state.currentSource;
  return state.playerSources[playerId] ?? null;
}
