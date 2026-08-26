import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function RoundResultsScreen() {
  const { state, dispatch } = useGame();

  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const topPoints = Math.max(0, ...Object.values(state.lastRoundPoints));

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROUND {state.round} RESULTS</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {state.revealOrder.map((playerId, i) => {
          const player = state.players.find((p) => p.id === playerId);
          const answer = state.answers.find((a) => a.playerId === playerId);
          const points = state.lastRoundPoints[playerId] || 0;
          const isWinner = points > 0 && points === topPoints;
          return (
            <View key={playerId} style={[styles.card, isWinner && styles.cardWinner]}>
              <View style={styles.cardHeader}>
                <Text style={styles.answerLabel}>Answer {i + 1} — {player?.name}</Text>
                <Text style={styles.votes}>
                  {points} vote{points === 1 ? '' : 's'}
                  {isWinner ? ' 🏆' : ''}
                </Text>
              </View>
              <Text style={styles.answerText}>{answer?.text}</Text>
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.scoreboardTitle}>SCOREBOARD</Text>
      <View style={styles.scoreboard}>
        {sorted.map((p) => (
          <View key={p.id} style={styles.scoreRow}>
            <Text style={styles.scoreName}>{p.name}</Text>
            <Text style={styles.scoreValue}>{p.score}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonRow}>
        <PrimaryButton
          label="Next Round"
          onPress={() => dispatch({ type: 'NEXT_ROUND' })}
          style={styles.flexButton}
        />
        <PrimaryButton
          label="End Game"
          onPress={() => dispatch({ type: 'END_GAME' })}
          variant="secondary"
          style={styles.flexButton}
        />
      </View>
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
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 260,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardWinner: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  answerLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.inkFaint,
  },
  votes: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.accentStrong,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
  },
  scoreboardTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.inkFaint,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  scoreboard: {
    backgroundColor: colors.paperRaised,
    borderRadius: radii.md,
    borderColor: colors.rule,
    borderWidth: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  scoreName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.ink,
  },
  scoreValue: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.accentStrong,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  flexButton: {
    flex: 1,
  },
});
