import { GameState, Player, RoundSource, ROUND_SOURCE_MODE, PAGES_PER_ROUND } from './types';
import { PROMPTS } from '../data/prompts';
import chaptersData from '../data/chapters.json';
import pagesData from '../data/pages.json';

type WordEntry = { num: number; words: string[] };

const CHAPTER_COUNT = (chaptersData as WordEntry[]).length;
const PAGE_COUNT = (pagesData as WordEntry[]).length;

export function makeId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickPrompt(used: number[]): { index: number; text: string; used: number[] } {
  let pool = PROMPTS.map((_, i) => i).filter((i) => !used.includes(i));
  let nextUsed = used;
  if (pool.length === 0) {
    pool = PROMPTS.map((_, i) => i);
    nextUsed = [];
  }
  const index = pool[Math.floor(Math.random() * pool.length)];
  return { index, text: PROMPTS[index], used: [...nextUsed, index] };
}

function pickRoundSource(): RoundSource {
  if (ROUND_SOURCE_MODE === 'chapter') {
    return { type: 'chapter', num: Math.floor(Math.random() * CHAPTER_COUNT) + 1 };
  }
  const span = Math.max(1, PAGES_PER_ROUND);
  const maxStart = Math.max(1, PAGE_COUNT - span + 1);
  const start = Math.floor(Math.random() * maxStart) + 1;
  const end = Math.min(start + span - 1, PAGE_COUNT);
  return { type: 'pages', start, end };
}

export function getWordsForSource(source: RoundSource): string[] {
  if (source.type === 'chapter') {
    const entry = (chaptersData as WordEntry[]).find((c) => c.num === source.num);
    return entry ? entry.words : [];
  }
  const set = new Set<string>();
  (pagesData as WordEntry[]).forEach((pg) => {
    if (pg.num >= source.start && pg.num <= source.end) pg.words.forEach((w) => set.add(w));
  });
  return Array.from(set).sort();
}

export const initialState: GameState = {
  phase: 'players',
  players: [],
  round: 0,
  usedPromptIndices: [],
  currentPrompt: null,
  currentSource: null,
  turnOrder: [],
  turnIndex: 0,
  answers: [],
  revealOrder: [],
  voteTurnIndex: 0,
  votes: [],
  lastRoundPoints: {},
};

export type Action =
  | { type: 'ADD_PLAYER'; name: string }
  | { type: 'REMOVE_PLAYER'; id: string }
  | { type: 'START_GAME' }
  | { type: 'READY_FOR_ANSWER' }
  | { type: 'SUBMIT_ANSWER'; text: string }
  | { type: 'START_VOTING' }
  | { type: 'READY_FOR_VOTE' }
  | { type: 'SUBMIT_VOTE'; votedForPlayerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

function startRound(state: GameState, round: number): GameState {
  const { text, used } = pickPrompt(state.usedPromptIndices);
  const source = pickRoundSource();
  const turnOrder = shuffle(state.players.map((p) => p.id));
  return {
    ...state,
    phase: 'pass-answer',
    round,
    usedPromptIndices: used,
    currentPrompt: text,
    currentSource: source,
    turnOrder,
    turnIndex: 0,
    answers: [],
    revealOrder: [],
    voteTurnIndex: 0,
    votes: [],
    lastRoundPoints: {},
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'ADD_PLAYER': {
      const name = action.name.trim();
      if (!name) return state;
      const player: Player = { id: makeId(), name, score: 0 };
      return { ...state, players: [...state.players, player] };
    }

    case 'REMOVE_PLAYER': {
      return { ...state, players: state.players.filter((p) => p.id !== action.id) };
    }

    case 'START_GAME': {
      if (state.players.length < 2) return state;
      return startRound(state, 1);
    }

    case 'READY_FOR_ANSWER': {
      return { ...state, phase: 'answer' };
    }

    case 'SUBMIT_ANSWER': {
      const playerId = state.turnOrder[state.turnIndex];
      const answers = [...state.answers, { playerId, text: action.text }];
      const nextIndex = state.turnIndex + 1;
      if (nextIndex >= state.turnOrder.length) {
        return {
          ...state,
          answers,
          turnIndex: nextIndex,
          phase: 'reveal',
          revealOrder: shuffle(state.turnOrder),
        };
      }
      return { ...state, answers, turnIndex: nextIndex, phase: 'pass-answer' };
    }

    case 'START_VOTING': {
      return { ...state, phase: 'pass-vote', voteTurnIndex: 0, votes: [] };
    }

    case 'READY_FOR_VOTE': {
      return { ...state, phase: 'vote' };
    }

    case 'SUBMIT_VOTE': {
      const voterId = state.turnOrder[state.voteTurnIndex];
      const votes = [...state.votes, { voterId, votedForPlayerId: action.votedForPlayerId }];
      const nextIndex = state.voteTurnIndex + 1;
      if (nextIndex >= state.turnOrder.length) {
        const pointsByPlayer: Record<string, number> = {};
        votes.forEach((v) => {
          pointsByPlayer[v.votedForPlayerId] = (pointsByPlayer[v.votedForPlayerId] || 0) + 1;
        });
        const players = state.players.map((p) => ({
          ...p,
          score: p.score + (pointsByPlayer[p.id] || 0),
        }));
        return {
          ...state,
          votes,
          voteTurnIndex: nextIndex,
          phase: 'results',
          players,
          lastRoundPoints: pointsByPlayer,
        };
      }
      return { ...state, votes, voteTurnIndex: nextIndex, phase: 'pass-vote' };
    }

    case 'NEXT_ROUND': {
      return startRound(state, state.round + 1);
    }

    case 'END_GAME': {
      return { ...state, phase: 'final' };
    }

    case 'RESET': {
      return initialState;
    }

    default:
      return state;
  }
}
