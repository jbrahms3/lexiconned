import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';

export function PlayersScreen() {
  const { state, dispatch } = useGame();
  const [name, setName] = useState('');

  function addPlayer() {
    if (!name.trim()) return;
    dispatch({ type: 'ADD_PLAYER', name });
    setName('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.kicker}>A VOCABULARY CONFINED TO LONGBOURN</Text>
      <Text style={styles.title}>Lexiconned</Text>
      <Text style={styles.tagline}>
        Answer party prompts using only words from a random chapter of{' '}
        <Text style={styles.italic}>Pride and Prejudice</Text>.
      </Text>

      <Text style={styles.sectionLabel}>PLAYERS ({state.players.length})</Text>

      <FlatList
        data={state.players}
        keyExtractor={(p) => p.id}
        style={styles.list}
        contentContainerStyle={state.players.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={<Text style={styles.emptyText}>Add at least 2 players to begin.</Text>}
        renderItem={({ item }) => (
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.remove} onPress={() => dispatch({ type: 'REMOVE_PLAYER', id: item.id })}>
              Remove
            </Text>
          </View>
        )}
      />

      <View style={styles.addRow}>
        <TextInput
          style={styles.input}
          placeholder="Player name"
          placeholderTextColor={colors.inkFaint}
          value={name}
          onChangeText={setName}
          onSubmitEditing={addPlayer}
          returnKeyType="done"
        />
        <PrimaryButton label="Add" onPress={addPlayer} variant="secondary" />
      </View>

      <PrimaryButton
        label="Start Game"
        onPress={() => dispatch({ type: 'START_GAME' })}
        disabled={state.players.length < 2}
        style={styles.startButton}
      />
      {state.players.length < 2 && (
        <Text style={styles.hint}>Need at least 2 players.</Text>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperShadow,
    padding: spacing.lg,
    paddingTop: spacing.xl,
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
    fontSize: 44,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  tagline: {
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    lineHeight: 21,
  },
  italic: {
    fontFamily: fonts.bodyItalic,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.inkFaint,
    marginBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
    maxHeight: 260,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.bodyItalic,
    color: colors.inkFaint,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.paperRaised,
    borderColor: colors.rule,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  playerName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.ink,
  },
  remove: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.flag,
    letterSpacing: 0.5,
  },
  addRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.paperRaised,
  },
  startButton: {
    marginTop: spacing.lg,
  },
  hint: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.inkFaint,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
