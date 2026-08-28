import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { colors, fonts, playerColor, radii, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';

export function NetworkRevealScreen() {
  const { roomState, isHost, startVoting } = useNetworkGame();
  if (!roomState || !roomState.currentPrompt) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROUND {roomState.round} · ALL ANSWERS</Text>
      <Text style={styles.prompt}>{roomState.currentPrompt}</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {roomState.revealOrder.map((playerId, i) => {
          const answer = roomState.answers.find((a) => a.playerId === playerId);
          const accent = playerColor(i);
          return (
            <View key={playerId} style={[styles.answerCard, { borderColor: accent }]}>
              <Text style={[styles.answerLabel, { color: accent }]}>Answer {i + 1}</Text>
              <Text style={styles.answerText}>{answer?.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      {isHost ? (
        <PrimaryButton label="Start Voting" onPress={startVoting} />
      ) : (
        <Text style={styles.waitingHint}>Waiting for the host to start voting…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  answerCard: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  answerLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 23,
    color: colors.text,
  },
  waitingHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
});
