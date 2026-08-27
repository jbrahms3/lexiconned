import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

interface Props {
  prompt: string;
  sourceLabel: string;
  accentColor?: string;
}

export function PromptCard({ prompt, sourceLabel, accentColor = colors.primary }: Props) {
  return (
    <View style={[styles.card, { borderColor: accentColor }]}>
      <Text style={[styles.kicker, { color: accentColor }]}>{sourceLabel}</Text>
      <Text style={styles.prompt}>{prompt}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
});
