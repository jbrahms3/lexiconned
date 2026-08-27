import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, playerColor, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function FinalScreen() {
  const { state, dispatch } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const winners = sorted.filter((p) => p.score === winner?.score);
  const winnerIndex = winner ? state.players.findIndex((p) => p.id === winner.id) : 0;
  const winnerColor = playerColor(winnerIndex);

  return (
    <View style={styles.container}>
      <Text style={styles.confetti}>🎉 🎊 🎉</Text>
      <Text style={styles.kicker}>GAME OVER</Text>
      <Text style={[styles.title, { color: winnerColor }]}>
        {winners.length > 1 ? "It's a tie!" : `${winner?.name} wins!`}
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sorted.map((p, i) => {
          const idx = state.players.findIndex((pl) => pl.id === p.id);
          const accent = playerColor(idx);
          return (
            <View key={p.id} style={[styles.row, { borderColor: accent }, i === 0 && styles.rowFirst]}>
              <Text style={[styles.place, { color: accent }]}>{i + 1}</Text>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={[styles.score, { color: accent }]}>{p.score}</Text>
            </View>
          );
        })}
      </ScrollView>

      <PrimaryButton label="Play Again" onPress={() => dispatch({ type: 'RESET' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
  },
  confetti: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 36,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    flexGrow: 0,
    maxHeight: 320,
    marginBottom: spacing.lg,
  },
  listContent: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowFirst: {
    borderWidth: 3,
  },
  place: {
    fontFamily: fonts.mono,
    fontSize: 14,
    width: 20,
  },
  name: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.text,
    flex: 1,
  },
  score: {
    fontFamily: fonts.mono,
    fontSize: 18,
  },
});
