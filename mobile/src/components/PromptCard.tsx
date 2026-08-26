import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

interface Props {
  prompt: string;
  chapter: number;
}

export function PromptCard({ prompt, chapter }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>CHAPTER {chapter} WORDS ONLY</Text>
      <Text style={styles.prompt}>{prompt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.paperRaised,
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.inkFaint,
    marginBottom: spacing.sm,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.ink,
  },
});
