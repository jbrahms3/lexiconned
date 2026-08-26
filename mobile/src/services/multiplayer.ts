/**
 * Multiplayer seam.
 *
 * Today the game is hotseat: one phone is passed between players, and
 * `GameContext` holds all state locally in memory. This file exists so a
 * future networked mode (each player on their own phone, joined via a room
 * code) can be dropped in without reworking the screens.
 *
 * A networked implementation would back this interface with something like
 * Supabase Realtime, Firebase, or a small WebSocket server: `createRoom`
 * generates a room code and persists initial state, `submitAnswer`/
 * `submitVote` write to shared state instead of dispatching locally, and
 * `subscribeToRoom` replaces polling the local reducer with a realtime
 * subscription. None of that exists yet — this is intentionally unused
 * scaffolding until that work is picked up.
 */

import { Answer, Vote } from '../state/types';

export interface RoomState {
  code: string;
  playerNames: string[];
  round: number;
  prompt: string | null;
  chapter: number | null;
  answers: Answer[];
  votes: Vote[];
}

export interface MultiplayerService {
  createRoom(hostName: string): Promise<{ code: string }>;
  joinRoom(code: string, playerName: string): Promise<void>;
  submitAnswer(code: string, playerId: string, text: string): Promise<void>;
  submitVote(code: string, voterId: string, votedForPlayerId: string): Promise<void>;
  subscribeToRoom(code: string, onUpdate: (room: RoomState) => void): () => void;
}

/**
 * Placeholder local implementation. Not wired into the app yet — the app
 * currently uses `GameContext`'s reducer directly for hotseat play. This
 * exists purely to pin down the interface shape for the future networked
 * version.
 */
export const localMultiplayerService: MultiplayerService = {
  async createRoom() {
    throw new Error('Networked multiplayer is not implemented yet — see services/multiplayer.ts');
  },
  async joinRoom() {
    throw new Error('Networked multiplayer is not implemented yet — see services/multiplayer.ts');
  },
  async submitAnswer() {
    throw new Error('Networked multiplayer is not implemented yet — see services/multiplayer.ts');
  },
  async submitVote() {
    throw new Error('Networked multiplayer is not implemented yet — see services/multiplayer.ts');
  },
  subscribeToRoom() {
    throw new Error('Networked multiplayer is not implemented yet — see services/multiplayer.ts');
  },
};
