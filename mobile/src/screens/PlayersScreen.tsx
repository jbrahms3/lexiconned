import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, playerColor, radii, spacing } from '../theme';
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
      <Text style={styles.kicker}>A PARTY GAME OF BORROWED WORDS</Text>
      <Text style={styles.title}>Lexiconned</Text>
      <Text style={styles.tagline}>
        Answer party prompts using only words from a random page or two of{' '}
        <Text style={styles.italic}>Pride and Prejudice</Text>.
      </Text>

      <Text style={styles.sectionLabel}>PAGES PER ROUND</Text>
      <View style={styles.pageCountToggle}>
        {([1, 2] as const).map((count) => {
          const isActive = state.pagesPerRound === count;
          return (
            <Pressable
              key={count}
              style={[styles.pageCountBtn, isActive && styles.pageCountBtnActive]}
              onPress={() => dispatch({ type: 'SET_PAGES_PER_ROUND', count })}
            >
              <Text style={[styles.pageCountLabel, isActive && styles.pageCountLabelActive]}>
                {count} Page{count === 1 ? '' : 's'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sectionLabelRow}>
        <Text style={styles.sectionLabel}>PROMPT STYLE</Text>
        {state.promptMode === 'spicy' && <Text style={styles.ageBadge}>18+</Text>}
      </View>
      <View style={styles.pageCountToggle}>
        {(['classic', 'spicy'] as const).map((mode) => {
          const isActive = state.promptMode === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.pageCountBtn, isActive && styles.pageCountBtnActive]}
              onPress={() => dispatch({ type: 'SET_PROMPT_MODE', mode })}
            >
              <Text style={[styles.pageCountLabel, isActive && styles.pageCountLabelActive]}>
                {mode === 'classic' ? 'Classic' : 'Raunchy'}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {state.promptMode === 'spicy' && (
        <Text style={styles.spicyHint}>Adults only — exes, hangovers, and bad decisions ahead.</Text>
      )}

      <Text style={styles.sectionLabel}>VOCABULARY SOURCE</Text>
      <View style={styles.pageCountToggle}>
        {([
          { mode: 'shared' as const, label: 'Same Pages' },
          { mode: 'perPlayer' as const, label: 'Different Pages' },
        ]).map(({ mode, label }) => {
          const isActive = state.sourceMode === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.pageCountBtn, isActive && styles.pageCountBtnActive]}
              onPress={() => dispatch({ type: 'SET_SOURCE_MODE', mode })}
            >
              <Text style={[styles.pageCountLabel, isActive && styles.pageCountLabelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.helperText}>
        {state.sourceMode === 'shared'
          ? 'Everyone writes with the same rolled pages each round.'
          : 'Each player rolls their own pages right before their turn.'}
      </Text>

      <Text style={styles.sectionLabel}>PLAYERS ({state.players.length})</Text>

      <FlatList
        data={state.players}
        keyExtractor={(p) => p.id}
        style={styles.list}
        contentContainerStyle={state.players.length === 0 ? styles.emptyList : undefined}
        ListEmptyComponent={<Text style={styles.emptyText}>Add at least 2 players to begin.</Text>}
        renderItem={({ item, index }) => (
          <View style={[styles.playerRow, { borderColor: playerColor(index) }]}>
            <View style={styles.playerNameRow}>
              <View style={[styles.dot, { backgroundColor: playerColor(index) }]} />
              <Text style={styles.playerName}>{item.name}</Text>
            </View>
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
          placeholderTextColor={colors.textFaint}
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
    backgroundColor: colors.bg,
    padding: spacing.lg,
    paddingTop: spacing.xl,
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
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ageBadge: {
    fontFamily: fonts.mono,
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.onPrimary,
    backgroundColor: colors.flag,
    borderRadius: radii.pill,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginBottom: spacing.sm,
  },
  spicyHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.flag,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  pageCountToggle: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  helperText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  pageCountBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  pageCountBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pageCountLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.textSoft,
  },
  pageCountLabelActive: {
    color: colors.onPrimary,
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
    color: colors.textFaint,
    textAlign: 'center',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  playerName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 17,
    color: colors.text,
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
  startButton: {
    marginTop: spacing.lg,
  },
  hint: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
