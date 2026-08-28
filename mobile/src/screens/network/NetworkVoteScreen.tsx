import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { colors, fonts, playerColor, radii, spacing } from '../../theme';

export function NetworkVoteScreen() {
  const { roomState, playerId, submitVote } = useNetworkGame();
  const [voted, setVoted] = useState(false);

  if (!roomState || !playerId || !roomState.currentPrompt) return null;

  const alreadyVoted = voted || roomState.votes.some((v) => v.voterId === playerId);
  const votedCount = roomState.votes.length;
  const totalPlayers = roomState.players.length;

  if (alreadyVoted) {
    return (
      <View style={styles.waitContainer}>
        <Text style={styles.kicker}>VOTE SUBMITTED</Text>
        <Text style={styles.waitTitle}>Waiting for everyone else…</Text>
        <Text style={styles.waitCount}>
          {votedCount} / {totalPlayers} voted
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>PICK YOUR FAVORITE · {votedCount}/{totalPlayers} VOTED</Text>
      <Text style={styles.prompt}>{roomState.currentPrompt}</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {roomState.revealOrder.map((answerPlayerId, i) => {
          const isOwn = answerPlayerId === playerId;
          const answer = roomState.answers.find((a) => a.playerId === answerPlayerId);
          const accent = playerColor(i);
          return (
            <Pressable
              key={answerPlayerId}
              disabled={isOwn}
              style={[styles.card, { borderColor: accent }, isOwn && styles.cardDisabled]}
              onPress={() => {
                submitVote(answerPlayerId);
                setVoted(true);
              }}
            >
              <Text style={[styles.label, { color: accent }]}>
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
    color: colors.textFaint,
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
