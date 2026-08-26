import { GameState, Player } from './types';
import { PROMPTS } from '../data/prompts';
import chaptersData from '../data/chapters.json';

const CHAPTER_COUNT = (chaptersData as { num: number; words: string[] }[]).length;

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

function pickChapter(): number {
  return Math.floor(Math.random() * CHAPTER_COUNT) + 1;
}

export function getChapterWords(chapterNum: number): string[] {
  const entry = (chaptersData as { num: number; words: string[] }[]).find((c) => c.num === chapterNum);
  return entry ? entry.words : [];
}

export const initialState: GameState = {
  phase: 'players',
  players: [],
  round: 0,
  usedPromptIndices: [],
  currentPrompt: null,
  currentChapter: null,
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
      const { index, text, used } = pickPrompt(state.usedPromptIndices);
      const chapter = pickChapter();
      const turnOrder = shuffle(state.players.map((p) => p.id));
      return {
        ...state,
        phase: 'pass-answer',
        round: 1,
        usedPromptIndices: used,
        currentPrompt: text,
        currentChapter: chapter,
        turnOrder,
        turnIndex: 0,
        answers: [],
        revealOrder: [],
        voteTurnIndex: 0,
        votes: [],
        lastRoundPoints: {},
      };
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
      const { index, text, used } = pickPrompt(state.usedPromptIndices);
      const chapter = pickChapter();
      const turnOrder = shuffle(state.players.map((p) => p.id));
      return {
        ...state,
        phase: 'pass-answer',
        round: state.round + 1,
        usedPromptIndices: used,
        currentPrompt: text,
        currentChapter: chapter,
        turnOrder,
        turnIndex: 0,
        answers: [],
        revealOrder: [],
        voteTurnIndex: 0,
        votes: [],
        lastRoundPoints: {},
      };
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
