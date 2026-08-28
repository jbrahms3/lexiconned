import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { CHAPTER_COUNT, PAGE_COUNT } from '../state/gameReducer';
import { colors, fonts, playerColor, PLAYER_COLORS, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { RollingReel } from '../components/RollingReel';

export function RollingScreen() {
  const { state, dispatch } = useGame();
  const source = state.currentSource;
  const [settledCount, setSettledCount] = useState(0);

  const reels =
    source?.type === 'pages'
      ? source.nums.map((num, i) => ({ key: `page-${i}`, value: num, label: `PAGE ${i + 1}` }))
      : source?.type === 'chapter'
        ? [{ key: 'chapter', value: source.num, label: 'CHAPTER' }]
        : [];

  const maxValue = source?.type === 'pages' ? PAGE_COUNT : CHAPTER_COUNT;
  const allSettled = reels.length > 0 && settledCount >= reels.length;

  const rollingPlayerId = state.turnOrder[state.turnIndex];
  const rollingPlayer = state.players.find((p) => p.id === rollingPlayerId);
  const rollingPlayerIndex = state.players.findIndex((p) => p.id === rollingPlayerId);
  const isPerPlayer = state.sourceMode === 'perPlayer' && rollingPlayer;
  const accent = isPerPlayer ? playerColor(rollingPlayerIndex) : colors.text;

  if (!source) return null;

  const unit = source.type === 'pages' ? 'pages' : 'a chapter';
  const title = isPerPlayer ? `Rolling ${rollingPlayer!.name}'s ${unit}…` : `Rolling for ${unit}…`;

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROUND {state.round}</Text>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>

      <View style={styles.reelsRow}>
        {reels.map((reel, i) => (
          <RollingReel
            key={reel.key}
            finalValue={reel.value}
            label={reel.label}
            maxValue={maxValue}
            color={isPerPlayer ? accent : PLAYER_COLORS[i % PLAYER_COLORS.length]}
            spinDurationMs={1100 + i * 500}
            onSettle={() => setSettledCount((c) => c + 1)}
          />
        ))}
      </View>

      {allSettled && (
        <PrimaryButton
          label="Let's Go"
          onPress={() => dispatch({ type: 'ROLL_COMPLETE' })}
          color={isPerPlayer ? accent : undefined}
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  reelsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  button: {
    marginTop: spacing.xl,
    minWidth: 180,
  },
});
