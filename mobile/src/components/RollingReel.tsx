import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text } from 'react-native';
import { colors, fonts, radii } from '../theme';

export interface RollingReelProps {
  finalValue: number;
  label: string;
  maxValue: number;
  color: string;
  spinDurationMs: number;
  onSettle: () => void;
}

/** One slot-machine-style reel: spins through random numbers, then settles on `finalValue`. */
export function RollingReel({ finalValue, label, maxValue, color, spinDurationMs, onSettle }: RollingReelProps) {
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

const styles = StyleSheet.create({
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
    marginBottom: 6,
  },
  reelNumber: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
