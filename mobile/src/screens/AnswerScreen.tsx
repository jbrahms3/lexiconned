import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useGame } from '../state/GameContext';
import { getChapterWords } from '../state/gameReducer';
import { checkText } from '../utils/wordCheck';
import { colors, fonts, radii, spacing } from '../theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { PromptCard } from '../components/PromptCard';
import { WordBankSheet } from '../components/WordBankSheet';

export function AnswerScreen() {
  const { state, dispatch } = useGame();
  const [text, setText] = useState('');
  const [bankVisible, setBankVisible] = useState(false);

  const playerId = state.turnOrder[state.turnIndex];
  const player = state.players.find((p) => p.id === playerId);
  const chapterWords = useMemo(
    () => (state.currentChapter ? getChapterWords(state.currentChapter) : []),
    [state.currentChapter],
  );
  const allowedSet = useMemo(() => new Set(chapterWords), [chapterWords]);
  const check = useMemo(() => checkText(text, allowedSet), [text, allowedSet]);

  const canSubmit = text.trim().length > 0 && check.flaggedWords.length === 0;

  function submit() {
    if (!canSubmit) return;
    dispatch({ type: 'SUBMIT_ANSWER', text: text.trim() });
    setText('');
  }

  if (!player || !state.currentPrompt || !state.currentChapter) return null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>{player.name.toUpperCase()}'S TURN</Text>
        <PromptCard prompt={state.currentPrompt} chapter={state.currentChapter} />

        <TextInput
          style={styles.input}
          multiline
          placeholder="Type your answer here…"
          placeholderTextColor={colors.inkFaint}
          value={text}
          onChangeText={setText}
        />

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {check.totalWords} word{check.totalWords === 1 ? '' : 's'}
            {check.flaggedWords.length > 0 && (
              <Text style={styles.flaggedText}> · {check.flaggedWords.length} not in chapter</Text>
            )}
          </Text>
          <Text style={styles.wordBankLink} onPress={() => setBankVisible(true)}>
            Browse Word Bank
          </Text>
        </View>

        {check.flaggedWords.length > 0 && (
          <View style={styles.flaggedBox}>
            <Text style={styles.flaggedTitle}>Not found in Chapter {state.currentChapter}:</Text>
            <Text style={styles.flaggedWords}>{check.flaggedWords.join(', ')}</Text>
          </View>
        )}

        <PrimaryButton
          label="Submit Answer"
          onPress={submit}
          disabled={!canSubmit}
          style={styles.submitButton}
        />
      </ScrollView>

      <WordBankSheet
        visible={bankVisible}
        words={chapterWords}
        onClose={() => setBankVisible(false)}
        onSelect={(word) => setText((prev) => (prev.length > 0 && !prev.endsWith(' ') ? prev + ' ' + word + ' ' : prev + word + ' '))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.paperShadow,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.inkFaint,
    marginBottom: spacing.sm,
  },
  input: {
    marginTop: spacing.md,
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.rule,
    borderRadius: radii.md,
    backgroundColor: colors.paperRaised,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 26,
    color: colors.ink,
    textAlignVertical: 'top',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusText: {
    fontFamily: fonts.monoRegular,
    fontSize: 12,
    color: colors.inkFaint,
  },
  flaggedText: {
    color: colors.flag,
  },
  wordBankLink: {
    fontFamily: fonts.mono,
    fontSize: 12,
    color: colors.accentStrong,
    letterSpacing: 0.3,
  },
  flaggedBox: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(162, 62, 72, 0.08)',
    borderRadius: radii.sm,
    padding: spacing.sm,
  },
  flaggedTitle: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.flag,
    marginBottom: 2,
  },
  flaggedWords: {
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.flag,
  },
  submitButton: {
    marginTop: spacing.lg,
  },
});
