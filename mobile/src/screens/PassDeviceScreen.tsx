import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, playerColor, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { PromptCard } from '../components/PromptCard';

interface Props {
  playerName: string;
  playerIndex: number;
  prompt: string;
  sourceLabel: string;
  subtitle: string;
  buttonLabel: string;
  onReady: () => void;
}

export function PassDeviceScreen({ playerName, playerIndex, prompt, sourceLabel, subtitle, buttonLabel, onReady }: Props) {
  const accent = playerColor(playerIndex);
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{subtitle}</Text>
      <Text style={styles.passTo}>Pass the phone to</Text>
      <Text style={[styles.playerName, { color: accent }]}>{playerName}</Text>

      <View style={styles.spacer} />

      <PromptCard prompt={prompt} sourceLabel={sourceLabel} accentColor={accent} />

      <View style={styles.spacer} />

      <PrimaryButton label={buttonLabel} onPress={onReady} color={accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  passTo: {
    fontFamily: fonts.bodyItalic,
    fontSize: 18,
    color: colors.textSoft,
    textAlign: 'center',
  },
  playerName: {
    fontFamily: fonts.displayBold,
    fontSize: 42,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  spacer: {
    height: spacing.lg,
  },
});
