import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useGame } from '../state/GameContext';
import { colors, fonts, playerColor, radii, spacing } from '../theme';

export function VoteScreen() {
  const { state, dispatch } = useGame();
  const voterId = state.turnOrder[state.voteTurnIndex];
  const voter = state.players.find((p) => p.id === voterId);
  const voterIndex = state.players.findIndex((p) => p.id === voterId);

  if (!voter || !state.currentPrompt) return null;
  const accent = playerColor(voterIndex);

  return (
    <View style={styles.container}>
      <Text style={[styles.kicker, { color: accent }]}>{voter.name.toUpperCase()}, PICK YOUR FAVORITE</Text>
      <Text style={styles.prompt}>{state.currentPrompt}</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {state.revealOrder.map((playerId, i) => {
          const isOwn = playerId === voterId;
          const answer = state.answers.find((a) => a.playerId === playerId);
          const cardAccent = playerColor(i);
          return (
            <Pressable
              key={playerId}
              disabled={isOwn}
              style={[styles.card, { borderColor: cardAccent }, isOwn && styles.cardDisabled]}
              onPress={() => dispatch({ type: 'SUBMIT_VOTE', votedForPlayerId: playerId })}
            >
              <Text style={[styles.label, { color: cardAccent }]}>
                Answer {i + 1} {isOwn ? '(yours — cannot vote for this)' : ''}
              </Text>
              <Text style={styles.text}>{answer?.text}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
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
  },
  prompt: {
    fontFamily: fonts.displayBold,
    fontSize: 22,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardDisabled: {
    opacity: 0.35,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 4,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 17,
    lineHeight: 23,
    color: colors.text,
  },
});
