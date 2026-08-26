import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function FinalScreen() {
  const { state, dispatch } = useGame();
  const sorted = [...state.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const winners = sorted.filter((p) => p.score === winner?.score);

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>GAME OVER</Text>
      <Text style={styles.title}>
        {winners.length > 1 ? "It's a tie!" : `${winner?.name} wins!`}
      </Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {sorted.map((p, i) => (
          <View key={p.id} style={[styles.row, i === 0 && styles.rowFirst]}>
            <Text style={styles.place}>{i + 1}</Text>
            <Text style={styles.name}>{p.name}</Text>
            <Text style={styles.score}>{p.score}</Text>
          </View>
        ))}
      </ScrollView>

      <PrimaryButton label="Play Again" onPress={() => dispatch({ type: 'RESET' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperShadow,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    color: colors.ink,
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
    backgroundColor: colors.paperRaised,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  rowFirst: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  place: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.inkFaint,
    width: 20,
  },
  name: {
    fontFamily: fonts.bodyMedium,
    fontSize: 18,
    color: colors.ink,
    flex: 1,
  },
  score: {
    fontFamily: fonts.mono,
    fontSize: 18,
    color: colors.accentStrong,
  },
});
