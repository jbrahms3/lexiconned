import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { PromptCard } from '../components/PromptCard';

interface Props {
  playerName: string;
  prompt: string;
  sourceLabel: string;
  subtitle: string;
  buttonLabel: string;
  onReady: () => void;
}

export function PassDeviceScreen({ playerName, prompt, sourceLabel, subtitle, buttonLabel, onReady }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>{subtitle}</Text>
      <Text style={styles.passTo}>Pass the phone to</Text>
      <Text style={styles.playerName}>{playerName}</Text>

      <View style={styles.spacer} />

      <PromptCard prompt={prompt} sourceLabel={sourceLabel} />

      <View style={styles.spacer} />

      <PrimaryButton label={buttonLabel} onPress={onReady} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperShadow,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 2,
    color: colors.inkFaint,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  passTo: {
    fontFamily: fonts.bodyItalic,
    fontSize: 18,
    color: colors.inkSoft,
    textAlign: 'center',
  },
  playerName: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  spacer: {
    height: spacing.lg,
  },
});
