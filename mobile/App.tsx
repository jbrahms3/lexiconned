import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_500Medium_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';
import {
  EBGaramond_400Regular,
  EBGaramond_400Regular_Italic,
  EBGaramond_500Medium,
} from '@expo-google-fonts/eb-garamond';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';

import { GameProvider, useGame } from './src/state/GameContext';
import { formatSourceLabel } from './src/utils/sourceLabel';
import { colors } from './src/theme';
import { PlayersScreen } from './src/screens/PlayersScreen';
import { PassDeviceScreen } from './src/screens/PassDeviceScreen';
import { AnswerScreen } from './src/screens/AnswerScreen';
import { RevealScreen } from './src/screens/RevealScreen';
import { VoteScreen } from './src/screens/VoteScreen';
import { RoundResultsScreen } from './src/screens/RoundResultsScreen';
import { FinalScreen } from './src/screens/FinalScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { state, dispatch } = useGame();

  switch (state.phase) {
    case 'players':
      return <PlayersScreen />;

    case 'pass-answer': {
      const playerId = state.turnOrder[state.turnIndex];
      const player = state.players.find((p) => p.id === playerId);
      if (!player || !state.currentPrompt || !state.currentSource) return null;
      return (
        <PassDeviceScreen
          playerName={player.name}
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
      return (
        <PassDeviceScreen
          playerName={voter.name}
          prompt={state.currentPrompt}
          sourceLabel={formatSourceLabel(state.currentSource)}
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

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_500Medium_Italic,
    EBGaramond_400Regular,
    EBGaramond_400Regular_Italic,
    EBGaramond_500Medium,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <View style={styles.flex} onLayout={onLayoutRootView}>
      <GameProvider>
        <Root />
      </GameProvider>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.paperShadow,
  },
});
