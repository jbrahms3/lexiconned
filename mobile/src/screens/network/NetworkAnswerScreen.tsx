import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSelectionChangeEventData,
  View,
} from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { sourceForPlayer } from '../../state/networkTypes';
import { getWordsForSource } from '../../state/gameReducer';
import { checkText, currentWordPrefix, suggestWords } from '../../utils/wordCheck';
import { formatSourceLabel } from '../../utils/sourceLabel';
import { colors, fonts, playerColor, radii, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PromptCard } from '../../components/PromptCard';
import { WordBankSheet } from '../../components/WordBankSheet';

export function NetworkAnswerScreen() {
  const { roomState, playerId, submitAnswer } = useNetworkGame();
  const [text, setText] = useState('');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [bankVisible, setBankVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const myIndex = roomState ? roomState.players.findIndex((p) => p.id === playerId) : -1;
  const accent = playerColor(myIndex);
  const source = roomState && playerId ? sourceForPlayer(roomState, playerId) : null;

  const sourceWords = useMemo(() => (source ? getWordsForSource(source) : []), [source]);
  const allowedSet = useMemo(() => new Set(sourceWords), [sourceWords]);
  const check = useMemo(() => checkText(text, allowedSet), [text, allowedSet]);

  const wordInProgress = useMemo(
    () => (selection.start === selection.end ? currentWordPrefix(text, selection.start) : null),
    [text, selection],
  );
  const suggestions = useMemo(() => {
    if (!wordInProgress || !wordInProgress.prefix) return [];
    const matches = suggestWords(wordInProgress.prefix, sourceWords);
    if (matches.length === 1 && matches[0] === wordInProgress.prefix && wordInProgress.start === selection.start) {
      return [];
    }
    return matches;
  }, [wordInProgress, sourceWords, selection.start]);

  const answeredCount = roomState?.answers.length ?? 0;
  const totalPlayers = roomState?.players.length ?? 0;

  if (!roomState || !playerId || !roomState.currentPrompt || !source) return null;

  const alreadyAnswered = submitted || roomState.answers.some((a) => a.playerId === playerId);
  const sourceLabel = formatSourceLabel(source);
  const canSubmit = text.trim().length > 0 && check.flaggedWords.length === 0;

  function submit() {
    if (!canSubmit) return;
    submitAnswer(text.trim());
    setSubmitted(true);
  }

  function acceptSuggestion(word: string) {
    if (!wordInProgress) return;
    const { start } = wordInProgress;
    const end = selection.start;
    const before = text.slice(0, start);
    const after = text.slice(end);
    let insert = word;
    if (after.length === 0 || !/\s/.test(after[0])) insert += ' ';
    const newText = before + insert + after;
    const newCursor = before.length + insert.length;
    setText(newText);
    setSelection({ start: newCursor, end: newCursor });
    inputRef.current?.focus();
  }

  function handleSelectionChange(e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) {
    setSelection(e.nativeEvent.selection);
  }

  if (alreadyAnswered) {
    return (
      <View style={styles.waitContainer}>
        <Text style={styles.kicker}>ANSWER SUBMITTED</Text>
        <Text style={styles.waitTitle}>Waiting for everyone else…</Text>
        <Text style={styles.waitCount}>
          {answeredCount} / {totalPlayers} answered
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={[styles.kicker, { color: accent }]}>
          {answeredCount} / {totalPlayers} ANSWERED
        </Text>
        <PromptCard prompt={roomState.currentPrompt} sourceLabel={sourceLabel} accentColor={accent} />

        <TextInput
          ref={inputRef}
          style={styles.input}
          multiline
          placeholder="Type your answer here…"
          placeholderTextColor={colors.textFaint}
          value={text}
          onChangeText={setText}
          onSelectionChange={handleSelectionChange}
        />

        {suggestions.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestRow}
            contentContainerStyle={styles.suggestContent}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.map((word) => (
              <Pressable key={word} style={styles.suggestChip} onPress={() => acceptSuggestion(word)}>
                <Text style={styles.suggestPrefix}>{wordInProgress?.prefix}</Text>
                <Text style={styles.suggestRest}>{word.slice(wordInProgress?.prefix.length || 0)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {check.totalWords} word{check.totalWords === 1 ? '' : 's'}
            {check.flaggedWords.length > 0 && (
              <Text style={styles.flaggedText}> · {check.flaggedWords.length} not allowed</Text>
            )}
          </Text>
          <Text style={[styles.wordBankLink, { color: accent }]} onPress={() => setBankVisible(true)}>
            Browse Word Bank
          </Text>
        </View>

        {check.flaggedWords.length > 0 && (
          <View style={styles.flaggedBox}>
            <Text style={styles.flaggedTitle}>Not found in the {sourceLabel.replace(' WORDS ONLY', '').toLowerCase()}:</Text>
            <Text style={styles.flaggedWords}>{check.flaggedWords.join(', ')}</Text>
          </View>
        )}

        <PrimaryButton label="Submit Answer" onPress={submit} disabled={!canSubmit} color={accent} style={styles.submitButton} />
      </ScrollView>

      <WordBankSheet
        visible={bankVisible}
        words={sourceWords}
        onClose={() => setBankVisible(false)}
        onSelect={(word) => {
          setText((prev) => {
            const next = prev.length > 0 && !prev.endsWith(' ') ? prev + ' ' + word + ' ' : prev + word + ' ';
            setSelection({ start: next.length, end: next.length });
            return next;
          });
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  input: {
    marginTop: spacing.md,
    minHeight: 140,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 26,
    color: colors.text,
    textAlignVertical: 'top',
  },
  suggestRow: {
    flexGrow: 0,
    marginTop: spacing.xs,
  },
  suggestContent: {
    gap: 6,
    paddingVertical: 2,
  },
  suggestChip: {
    flexDirection: 'row',
    backgroundColor: colors.chipBg,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  suggestPrefix: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primaryStrong,
  },
  suggestRest: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.textSoft,
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
    color: colors.textFaint,
  },
  flaggedText: {
    color: colors.flag,
  },
  wordBankLink: {
    fontFamily: fonts.mono,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  flaggedBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.flagBg,
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
  waitContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    color: colors.text,
    marginTop: spacing.xs,
  },
  waitCount: {
    fontFamily: fonts.mono,
    fontSize: 14,
    color: colors.textFaint,
    marginTop: spacing.sm,
  },
});
