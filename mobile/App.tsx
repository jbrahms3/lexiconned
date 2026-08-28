import React, { useCallback, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  Baloo2_500Medium,
  Baloo2_600SemiBold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_500Medium_Italic,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

import { GameProvider, useGame } from './src/state/GameContext';
import { NetworkGameProvider, useNetworkGame } from './src/state/NetworkGameContext';
import { formatSourceLabel } from './src/utils/sourceLabel';
import { colors } from './src/theme';
import { ModeSelectScreen } from './src/screens/ModeSelectScreen';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { RollingScreen } from './src/screens/RollingScreen';
import { PassDeviceScreen } from './src/screens/PassDeviceScreen';
import { AnswerScreen } from './src/screens/AnswerScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { RoundResultsScreen } from './src/screens/RoundResultsScreen';
import { FinalScreen } from './src/screens/FinalScreen';
import { LobbyScreen } from './src/screens/network/LobbyScreen';
import { WaitingRoomScreen } from './src/screens/network/WaitingRoomScreen';
import { NetworkRollingScreen } from './src/screens/network/NetworkRollingScreen';
import { NetworkAnswerScreen } from './src/screens/network/NetworkAnswerScreen';
import { NetworkRevealScreen } from './src/screens/network/NetworkRevealScreen';
import { NetworkVoteScreen } from './src/screens/network/NetworkVoteScreen';
import { NetworkResultsScreen } from './src/screens/network/NetworkResultsScreen';
import { NetworkFinalScreen } from './src/screens/network/NetworkFinalScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

type AppMode = 'select' | 'hotseat' | 'online';

function HotseatRoot() {
  const { state, dispatch } = useGame();

  switch (state.phase) {
    case 'players':
      return <PlayersScreen />;

    case 'rolling':
      return <RollingScreen />;

    case 'pass-answer': {
      const playerId = state.turnOrder[state.turnIndex];
      const player = state.players.find((p) => p.id === playerId);
      if (!player || !state.currentPrompt || !state.currentSource) return null;
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      return (
        <PassDeviceScreen
          playerName={player.name}
          playerIndex={playerIndex}
          prompt={state.currentPrompt}
          sourceLabel={formatSourceLabel(state.currentSource)}
          subtitle={`ROUND ${state.round} · YOUR TURN TO ANSWER`}
          buttonLabel="I'm Ready"
          onReady={() => dispatch({ type: 'READY_FOR_ANSWER' })}
        />
      );
    }

    case 'answer':
      return <AnswerScreen />;

    case 'reveal':
      return <RevealScreen />;

    case 'pass-vote': {
      const voterId = state.turnOrder[state.voteTurnIndex];
      const voter = state.players.find((p) => p.id === voterId);
      if (!voter || !state.currentPrompt || !state.currentSource) return null;
      const voterIndex = state.players.findIndex((p) => p.id === voterId);
      return (
        <PassDeviceScreen
          playerName={voter.name}
          playerIndex={voterIndex}
          prompt={state.currentPrompt}
          sourceLabel={
            state.sourceMode === 'perPlayer'
              ? 'EACH ANSWER USED ITS OWN PAGES'
              : formatSourceLabel(state.currentSource)
          }
          subtitle={`ROUND ${state.round} · YOUR TURN TO VOTE`}
          buttonLabel="I'm Ready"
          onReady={() => dispatch({ type: 'READY_FOR_VOTE' })}
        />
      );
    }

    case 'vote':
      return <VoteScreen />;

    case 'results':
      return <RoundResultsScreen />;

    case 'final':
      return <FinalScreen />;

    default:
      return null;
  }
}

function NetworkRoot({ onBackToSelect }: { onBackToSelect: () => void }) {
  const { roomState } = useNetworkGame();

  if (!roomState) return <LobbyScreen onBack={onBackToSelect} />;

  switch (roomState.phase) {
    case 'lobby':
      return <WaitingRoomScreen />;
    case 'rolling':
      return <NetworkRollingScreen />;
    case 'answering':
      return <NetworkAnswerScreen />;
    case 'reveal':
      return <NetworkRevealScreen />;
    case 'voting':
      return <NetworkVoteScreen />;
    case 'results':
      return <NetworkResultsScreen />;
    case 'final':
      return <NetworkFinalScreen onLeave={onBackToSelect} />;
    default:
      return null;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Baloo2_500Medium,
    Baloo2_600SemiBold,
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_500Medium_Italic,
    Nunito_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });
  const [mode, setMode] = useState<AppMode>('select');

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  let content: React.ReactNode;
  if (mode === 'select') {
    content = <ModeSelectScreen onSelectHotseat={() => setMode('hotseat')} onSelectOnline={() => setMode('online')} />;
  } else if (mode === 'hotseat') {
    content = (
      <GameProvider>
        <HotseatRoot />
      </GameProvider>
    );
  } else {
    content = (
      <NetworkGameProvider>
        <NetworkRoot onBackToSelect={() => setMode('select')} />
      </NetworkGameProvider>
    );
  }

  return (
    <View style={styles.flex} onLayout={onLayoutRootView}>
      {content}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
