import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { colors, fonts, radii, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';

interface Props {
  onBack: () => void;
}

export function LobbyScreen({ onBack }: Props) {
  const { createRoom, joinRoom, status, error, clearError } = useNetworkGame();
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'choose' | 'join'>('choose');

  const connecting = status === 'connecting';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.kicker}>PLAY ONLINE</Text>
      <Text style={styles.title}>{mode === 'choose' ? 'Create or Join' : 'Join a Room'}</Text>

      {status === 'closed' && (
        <Text style={styles.statusWarning}>Not connected to the server — trying to reconnect…</Text>
      )}

      <Text style={styles.label}>YOUR NAME</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor={colors.textFaint}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
        maxLength={24}
      />

      {mode === 'join' && (
        <>
          <Text style={styles.label}>ROOM CODE</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="ABCD"
            placeholderTextColor={colors.textFaint}
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={4}
          />
        </>
      )}

      {error && (
        <Text style={styles.error} onPress={clearError}>
          {error}
        </Text>
      )}

      <View style={styles.spacer} />

      {mode === 'choose' ? (
        <>
          <PrimaryButton
            label="Create a Room"
            onPress={() => createRoom(name)}
            disabled={!name.trim() || connecting}
          />
          <View style={styles.spacerSm} />
          <PrimaryButton label="Join a Room" onPress={() => setMode('join')} variant="secondary" />
        </>
      ) : (
        <>
          <PrimaryButton
            label="Join"
            onPress={() => joinRoom(code, name)}
            disabled={!name.trim() || code.trim().length < 4 || connecting}
          />
          <View style={styles.spacerSm} />
          <PrimaryButton label="Back" onPress={() => setMode('choose')} variant="secondary" />
        </>
      )}

      <View style={styles.spacerSm} />
      <Text style={styles.backLink} onPress={onBack}>
        &larr; Back to mode select
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 34,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  statusWarning: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.flag,
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textFaint,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
  },
  codeInput: {
    fontFamily: fonts.mono,
    fontSize: 24,
    letterSpacing: 6,
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.flag,
    marginTop: spacing.sm,
  },
  spacer: {
    height: spacing.lg,
  },
  spacerSm: {
    height: spacing.sm,
  },
  backLink: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
  },
});
