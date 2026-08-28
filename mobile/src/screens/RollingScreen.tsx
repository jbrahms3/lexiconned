import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { CHAPTER_COUNT, PAGE_COUNT } from '../state/gameReducer';
import { colors, fonts, playerColor, PLAYER_COLORS, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

interface ReelProps {
  finalValue: number;
  label: string;
  maxValue: number;
  color: string;
  spinDurationMs: number;
  onSettle: () => void;
}

function Reel({ finalValue, label, maxValue, color, spinDurationMs, onSettle }: ReelProps) {
  const [display, setDisplay] = useState(finalValue);
  const scale = useRef(new Animated.Value(1)).current;
  const wobble = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const tickMs = 55;
    const interval = setInterval(() => {
      setDisplay(Math.floor(Math.random() * maxValue) + 1);
    }, tickMs);

    Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 90, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(wobble, { toValue: -1, duration: 90, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ]),
    ).start();

    const timeout = setTimeout(() => {
      clearInterval(interval);
      wobble.stopAnimation();
      wobble.setValue(0);
      setDisplay(finalValue);
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 130, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 3.5, tension: 140 }),
      ]).start(onSettle);
    }, spinDurationMs);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finalValue, maxValue, spinDurationMs]);

  const rotate = wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-4deg', '4deg'] });

  return (
    <Animated.View style={[styles.reel, { borderColor: color, transform: [{ scale }, { rotate }] }]}>
      <Text style={[styles.reelLabel, { color }]}>{label}</Text>
      <Text style={styles.reelNumber}>{display}</Text>
    </Animated.View>
  );
}

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
          <Reel
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
  reel: {
    width: 130,
    height: 150,
    borderWidth: 3,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  reelLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
  },
  reelNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  button: {
    marginTop: spacing.xl,
    minWidth: 180,
  },
});
