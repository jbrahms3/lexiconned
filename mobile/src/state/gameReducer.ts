import { GameState, Player, PromptMode, RoundSource, SourceMode, ROUND_SOURCE_MODE, DEFAULT_PAGES_PER_ROUND, DEFAULT_PROMPT_MODE, DEFAULT_SOURCE_MODE } from './types';
import { PROMPTS } from '../data/prompts';
import { SPICY_PROMPTS } from '../data/spicyPrompts';
import chaptersData from '../data/chapters.json';
import pagesData from '../data/pages.json';

type WordEntry = { num: number; words: string[] };

export const CHAPTER_COUNT = (chaptersData as WordEntry[]).length;
export const PAGE_COUNT = (pagesData as WordEntry[]).length;

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

function promptPool(mode: PromptMode): string[] {
  return mode === 'spicy' ? SPICY_PROMPTS : PROMPTS;
}

function pickPrompt(mode: PromptMode, used: number[]): { text: string; used: number[] } {
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

/** Picks `count` distinct random page numbers — not necessarily adjacent. */
function pickDistinctPages(count: number): number[] {
  const n = Math.min(Math.max(1, count), PAGE_COUNT);
  const nums = new Set<number>();
  while (nums.size < n) {
    nums.add(Math.floor(Math.random() * PAGE_COUNT) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

function pickRoundSource(pagesPerRound: number): RoundSource {
  if (ROUND_SOURCE_MODE === 'chapter') {
    return { type: 'chapter', num: Math.floor(Math.random() * CHAPTER_COUNT) + 1 };
  }
  return { type: 'pages', nums: pickDistinctPages(pagesPerRound) };
}

export function getWordsForSource(source: RoundSource): string[] {
  if (source.type === 'chapter') {
    const entry = (chaptersData as WordEntry[]).find((c) => c.num === source.num);
    return entry ? entry.words : [];
  }
  const set = new Set<string>();
  (pagesData as WordEntry[]).forEach((pg) => {
    if (source.nums.includes(pg.num)) pg.words.forEach((w) => set.add(w));
  });
  return Array.from(set).sort();
}

export const initialState: GameState = {
  phase: 'players',
  players: [],
  round: 0,
  promptMode: DEFAULT_PROMPT_MODE,
  sourceMode: DEFAULT_SOURCE_MODE,
  usedPromptIndices: [],
  currentPrompt: null,
  currentSource: null,
  pagesPerRound: DEFAULT_PAGES_PER_ROUND,
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
  | { type: 'SET_PAGES_PER_ROUND'; count: 1 | 2 }
  | { type: 'SET_PROMPT_MODE'; mode: PromptMode }
  | { type: 'SET_SOURCE_MODE'; mode: SourceMode }
  | { type: 'START_GAME' }
  | { type: 'ROLL_COMPLETE' }
  | { type: 'READY_FOR_ANSWER' }
  | { type: 'SUBMIT_ANSWER'; text: string }
  | { type: 'START_VOTING' }
  | { type: 'READY_FOR_VOTE' }
  | { type: 'SUBMIT_VOTE'; votedForPlayerId: string }
  | { type: 'NEXT_ROUND' }
  | { type: 'END_GAME' }
  | { type: 'RESET' };

function startRound(state: GameState, round: number): GameState {
  const { text, used } = pickPrompt(state.promptMode, state.usedPromptIndices);
  const source = pickRoundSource(state.pagesPerRound);
  const turnOrder = shuffle(state.players.map((p) => p.id));
  return {
    ...state,
    phase: 'rolling',
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

    case 'SET_PAGES_PER_ROUND': {
      return { ...state, pagesPerRound: action.count };
    }

    case 'SET_PROMPT_MODE': {
      if (state.promptMode === action.mode) return state;
      return { ...state, promptMode: action.mode, usedPromptIndices: [] };
    }

    case 'SET_SOURCE_MODE': {
      return { ...state, sourceMode: action.mode };
    }

    case 'START_GAME': {
      if (state.players.length < 2) return state;
      return startRound(state, 1);
    }

    case 'ROLL_COMPLETE': {
      return { ...state, phase: 'pass-answer' };
    }

    case 'READY_FOR_ANSWER': {
      return { ...state, phase: 'answer' };
    }

    case 'SUBMIT_ANSWER': {
      if (!state.currentSource) return state;
      const playerId = state.turnOrder[state.turnIndex];
      const answers = [...state.answers, { playerId, text: action.text, source: state.currentSource }];
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
      if (state.sourceMode === 'perPlayer') {
        // Roll fresh for the next player before showing their pass-device screen.
        return {
          ...state,
          answers,
          turnIndex: nextIndex,
          phase: 'rolling',
          currentSource: pickRoundSource(state.pagesPerRound),
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
