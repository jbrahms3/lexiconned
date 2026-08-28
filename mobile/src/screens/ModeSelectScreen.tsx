import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

interface Props {
  onSelectHotseat: () => void;
  onSelectOnline: () => void;
}

export function ModeSelectScreen({ onSelectHotseat, onSelectOnline }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>A PARTY GAME OF BORROWED WORDS</Text>
      <Text style={styles.title}>Lexiconned</Text>
      <Text style={styles.tagline}>
        Answer party prompts using only words from a random page or two of{' '}
        <Text style={styles.italic}>Pride and Prejudice</Text>.
      </Text>

      <View style={styles.spacer} />

      <PrimaryButton label="Pass & Play" onPress={onSelectHotseat} style={styles.button} />
      <Text style={styles.modeHint}>One phone, passed around the group.</Text>

      <View style={styles.spacerSm} />

      <PrimaryButton label="Play Online" onPress={onSelectOnline} variant="secondary" style={styles.button} />
      <Text style={styles.modeHint}>Everyone joins from their own phone with a room code.</Text>
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
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.textSoft,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 21,
  },
  italic: {
    fontFamily: fonts.bodyItalic,
  },
  spacer: {
    height: spacing.xl,
  },
  spacerSm: {
    height: spacing.lg,
  },
  button: {
    width: '100%',
  },
  modeHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
