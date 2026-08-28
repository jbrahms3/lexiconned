import { RoomState, NetworkPlayer, ClientMessage, PromptMode, SourceMode } from './types';
import { pickRoundSource, getWordsForSource, textUsesOnlyAllowedWords } from './wordData';
import { pickPrompt } from './promptPool';
import { makePlayerId } from './ids';

export class RoomError extends Error {}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function requireHost(state: RoomState, playerId: string) {
  if (state.hostId !== playerId) throw new RoomError('Only the host can do that.');
}

function requirePhase(state: RoomState, ...phases: RoomState['phase'][]) {
  if (!phases.includes(state.phase)) throw new RoomError(`Not allowed during "${state.phase}".`);
}

export function createRoom(code: string, hostName: string): { state: RoomState; hostId: string } {
  const hostId = makePlayerId();
  const host: NetworkPlayer = { id: hostId, name: hostName.trim().slice(0, 24) || 'Host', score: 0, connected: true };
  const state: RoomState = {
    code,
    hostId,
    players: [host],
    phase: 'lobby',
    round: 0,
    promptMode: 'classic',
    sourceMode: 'shared',
    pagesPerRound: 2,
    usedPromptIndices: [],
    currentPrompt: null,
    currentSource: null,
    playerSources: {},
    answers: [],
    revealOrder: [],
    votes: [],
    lastRoundPoints: {},
  };
  return { state, hostId };
}

export function joinRoom(state: RoomState, playerName: string): { state: RoomState; playerId: string } {
  requirePhase(state, 'lobby');
  if (state.players.length >= 12) throw new RoomError('Room is full.');
  const playerId = makePlayerId();
  const player: NetworkPlayer = { id: playerId, name: playerName.trim().slice(0, 24) || 'Player', score: 0, connected: true };
  return { state: { ...state, players: [...state.players, player] }, playerId };
}

function startRound(state: RoomState, round: number): RoomState {
  const { text, used } = pickPrompt(state.promptMode, state.usedPromptIndices);
  const isShared = state.sourceMode === 'shared';
  const currentSource = isShared ? pickRoundSource(state.pagesPerRound) : null;
  const playerSources = isShared
    ? {}
    : Object.fromEntries(state.players.map((p) => [p.id, pickRoundSource(state.pagesPerRound)]));
  return {
    ...state,
    phase: 'rolling',
    round,
    usedPromptIndices: used,
    currentPrompt: text,
    currentSource,
    playerSources,
    answers: [],
    revealOrder: [],
    votes: [],
    lastRoundPoints: {},
  };
}

/** Called by the server after the rolling animation's fixed delay elapses. */
export function finishRolling(state: RoomState): RoomState {
  if (state.phase !== 'rolling') return state;
  return { ...state, phase: 'answering' };
}

function sourceForPlayer(state: RoomState, playerId: string) {
  if (state.sourceMode === 'shared') return state.currentSource;
  return state.playerSources[playerId] ?? null;
}

export function applyAction(state: RoomState, playerId: string, msg: ClientMessage): RoomState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new RoomError('You are not in this room.');

  switch (msg.type) {
    case 'SET_PAGES_PER_ROUND': {
      requireHost(state, playerId);
      requirePhase(state, 'lobby');
      return { ...state, pagesPerRound: msg.count };
    }

    case 'SET_PROMPT_MODE': {
      requireHost(state, playerId);
      requirePhase(state, 'lobby');
      if (state.promptMode === msg.mode) return state;
      return { ...state, promptMode: msg.mode, usedPromptIndices: [] };
    }

    case 'SET_SOURCE_MODE': {
      requireHost(state, playerId);
      requirePhase(state, 'lobby');
      return { ...state, sourceMode: msg.mode };
    }

    case 'START_GAME': {
      requireHost(state, playerId);
      requirePhase(state, 'lobby');
      if (state.players.length < 2) throw new RoomError('Need at least 2 players.');
      return startRound(state, 1);
    }

    case 'SUBMIT_ANSWER': {
      requirePhase(state, 'answering');
      if (state.answers.some((a) => a.playerId === playerId)) throw new RoomError('You already answered.');
      const source = sourceForPlayer(state, playerId);
      if (!source) throw new RoomError('No round source assigned yet.');
      const text = msg.text.trim();
      if (!text) throw new RoomError('Answer cannot be empty.');
      const allowed = getWordsForSource(source);
      if (!textUsesOnlyAllowedWords(text, allowed)) {
        throw new RoomError('Answer uses words outside the allowed pages.');
      }
      const answers = [...state.answers, { playerId, text, source }];
      if (answers.length >= state.players.length) {
        return { ...state, answers, phase: 'reveal', revealOrder: shuffle(state.players.map((p) => p.id)) };
      }
      return { ...state, answers };
    }

    case 'START_VOTING': {
      requireHost(state, playerId);
      requirePhase(state, 'reveal');
      return { ...state, phase: 'voting', votes: [] };
    }

    case 'SUBMIT_VOTE': {
      requirePhase(state, 'voting');
      if (state.votes.some((v) => v.voterId === playerId)) throw new RoomError('You already voted.');
      const votedAnswer = state.answers.find((a) => a.playerId === msg.votedForPlayerId);
      if (!votedAnswer) throw new RoomError('That answer does not exist.');
      if (votedAnswer.playerId === playerId) throw new RoomError('You cannot vote for your own answer.');
      const votes = [...state.votes, { voterId: playerId, votedForPlayerId: msg.votedForPlayerId }];
      if (votes.length >= state.players.length) {
        const pointsByPlayer: Record<string, number> = {};
        votes.forEach((v) => {
          pointsByPlayer[v.votedForPlayerId] = (pointsByPlayer[v.votedForPlayerId] || 0) + 1;
        });
        const players = state.players.map((p) => ({ ...p, score: p.score + (pointsByPlayer[p.id] || 0) }));
        return { ...state, votes, phase: 'results', players, lastRoundPoints: pointsByPlayer };
      }
      return { ...state, votes };
    }

    case 'NEXT_ROUND': {
      requireHost(state, playerId);
      requirePhase(state, 'results');
      return startRound(state, state.round + 1);
    }

    case 'END_GAME': {
      requireHost(state, playerId);
      requirePhase(state, 'results');
      return { ...state, phase: 'final' };
    }

    default:
      throw new RoomError(`Unhandled action: ${(msg as { type: string }).type}`);
  }
}

export function setConnected(state: RoomState, playerId: string, connected: boolean): RoomState {
  return { ...state, players: state.players.map((p) => (p.id === playerId ? { ...p, connected } : p)) };
}

/** If the host disconnects, hand hosting to the next connected player. */
export function reassignHostIfNeeded(state: RoomState): RoomState {
  const host = state.players.find((p) => p.id === state.hostId);
  if (host?.connected) return state;
  const next = state.players.find((p) => p.connected);
  if (!next) return state;
  return { ...state, hostId: next.id };
}
