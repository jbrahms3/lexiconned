import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { multiplayerClient, ConnectionStatus } from '../services/multiplayer';
import { RoomState, ClientMessage, PromptMode, SourceMode } from './networkTypes';

const STORAGE_KEY = 'lexiconned:lastRoom';

interface NetworkGameValue {
  roomState: RoomState | null;
  playerId: string | null;
  status: ConnectionStatus;
  error: string | null;
  isHost: boolean;
  createRoom: (hostName: string) => void;
  joinRoom: (code: string, playerName: string) => void;
  leaveRoom: () => void;
  send: (msg: ClientMessage) => void;
  clearError: () => void;
  // Convenience wrappers around send(), matching the hotseat reducer's action names.
  setPagesPerRound: (count: 1 | 2) => void;
  setPromptMode: (mode: PromptMode) => void;
  setSourceMode: (mode: SourceMode) => void;
  startGame: () => void;
  submitAnswer: (text: string) => void;
  startVoting: () => void;
  submitVote: (votedForPlayerId: string) => void;
  nextRound: () => void;
  endGame: () => void;
}

const NetworkGameContext = createContext<NetworkGameValue | null>(null);

export function NetworkGameProvider({ children }: { children: React.ReactNode }) {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>('closed');
  const [error, setError] = useState<string | null>(null);
  const attemptedRejoin = useRef(false);

  useEffect(() => {
    multiplayerClient.connect();
    const offState = multiplayerClient.onState(setRoomState);
    const offJoined = multiplayerClient.onJoined((code, id) => {
      setPlayerId(id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ code, playerId: id })).catch(() => {});
    });
    const offError = multiplayerClient.onError(setError);
    const offStatus = multiplayerClient.onStatus((s) => {
      setStatus(s);
      if (s === 'open' && !attemptedRejoin.current) {
        attemptedRejoin.current = true;
        AsyncStorage.getItem(STORAGE_KEY)
          .then((raw) => {
            if (!raw) return;
            const saved = JSON.parse(raw) as { code: string; playerId: string };
            multiplayerClient.send({ type: 'REJOIN_ROOM', code: saved.code, playerId: saved.playerId });
          })
          .catch(() => {});
      }
    });

    return () => {
      offState();
      offJoined();
      offError();
      offStatus();
      multiplayerClient.disconnect();
    };
  }, []);

  const send = useCallback((msg: ClientMessage) => multiplayerClient.send(msg), []);

  const createRoom = useCallback((hostName: string) => {
    attemptedRejoin.current = true; // creating fresh, skip any stale saved-room rejoin
    send({ type: 'CREATE_ROOM', hostName });
  }, [send]);

  const joinRoom = useCallback((code: string, playerName: string) => {
    attemptedRejoin.current = true;
    send({ type: 'JOIN_ROOM', code: code.trim().toUpperCase(), playerName });
  }, [send]);

  const leaveRoom = useCallback(() => {
    send({ type: 'LEAVE_ROOM' });
    setRoomState(null);
    setPlayerId(null);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  }, [send]);

  const clearError = useCallback(() => setError(null), []);

  const value: NetworkGameValue = {
    roomState,
    playerId,
    status,
    error,
    isHost: !!roomState && !!playerId && roomState.hostId === playerId,
    createRoom,
    joinRoom,
    leaveRoom,
    send,
    clearError,
    setPagesPerRound: (count) => send({ type: 'SET_PAGES_PER_ROUND', count }),
    setPromptMode: (mode) => send({ type: 'SET_PROMPT_MODE', mode }),
    setSourceMode: (mode) => send({ type: 'SET_SOURCE_MODE', mode }),
    startGame: () => send({ type: 'START_GAME' }),
    submitAnswer: (text) => send({ type: 'SUBMIT_ANSWER', text }),
    startVoting: () => send({ type: 'START_VOTING' }),
    submitVote: (votedForPlayerId) => send({ type: 'SUBMIT_VOTE', votedForPlayerId }),
    nextRound: () => send({ type: 'NEXT_ROUND' }),
    endGame: () => send({ type: 'END_GAME' }),
  };

  return <NetworkGameContext.Provider value={value}>{children}</NetworkGameContext.Provider>;
}

export function useNetworkGame(): NetworkGameValue {
  const ctx = useContext(NetworkGameContext);
  if (!ctx) throw new Error('useNetworkGame must be used within a NetworkGameProvider');
  return ctx;
}
