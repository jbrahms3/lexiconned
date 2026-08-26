import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function RevealScreen() {
  const { state, dispatch } = useGame();

  if (!state.currentPrompt) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROUND {state.round} · ALL ANSWERS</Text>
      <Text style={styles.prompt}>{state.currentPrompt}</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {state.revealOrder.map((playerId, i) => {
          const answer = state.answers.find((a) => a.playerId === playerId);
          return (
            <View key={playerId} style={styles.answerCard}>
              <Text style={styles.answerLabel}>Answer {i + 1}</Text>
              <Text style={styles.answerText}>{answer?.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.hint}>Read them aloud, then vote for your favorite.</Text>
      <PrimaryButton label="Start Voting" onPress={() => dispatch({ type: 'START_VOTING' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperShadow,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.inkFaint,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.ink,
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
    backgroundColor: colors.paperRaised,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  answerLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.inkFaint,
    marginBottom: 4,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 23,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginVertical: spacing.sm,
  },
});
