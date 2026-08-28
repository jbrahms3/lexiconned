import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { formatSourceLabel } from '../../utils/sourceLabel';
import { colors, fonts, playerColor, radii, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';

export function NetworkResultsScreen() {
  const { roomState, isHost, nextRound, endGame } = useNetworkGame();
  if (!roomState) return null;

  const sorted = [...roomState.players].sort((a, b) => b.score - a.score);
  const topPoints = Math.max(0, ...Object.values(roomState.lastRoundPoints));

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROUND {roomState.round} RESULTS</Text>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {roomState.revealOrder.map((playerId, i) => {
          const player = roomState.players.find((p) => p.id === playerId);
          const playerIndex = roomState.players.findIndex((p) => p.id === playerId);
          const answer = roomState.answers.find((a) => a.playerId === playerId);
          const points = roomState.lastRoundPoints[playerId] || 0;
          const isWinner = points > 0 && points === topPoints;
          const accent = playerColor(playerIndex);
          return (
            <View key={playerId} style={[styles.card, { borderColor: accent }, isWinner && styles.cardWinner]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.answerLabel, { color: accent }]}>Answer {i + 1} — {player?.name}</Text>
                <Text style={[styles.votes, { color: accent }]}>
                  {points} vote{points === 1 ? '' : 's'}
                  {isWinner ? ' 🏆' : ''}
                </Text>
              </View>
              <Text style={styles.answerText}>{answer?.text}</Text>
              {roomState.sourceMode === 'perPlayer' && answer && (
                <Text style={styles.sourceNote}>{formatSourceLabel(answer.source)}</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Text style={styles.scoreboardTitle}>SCOREBOARD</Text>
      <View style={styles.scoreboard}>
        {sorted.map((p) => {
          const idx = roomState.players.findIndex((pl) => pl.id === p.id);
          return (
            <View key={p.id} style={styles.scoreRow}>
              <View style={styles.scoreNameRow}>
                <View style={[styles.dot, { backgroundColor: playerColor(idx) }]} />
                <Text style={styles.scoreName}>{p.name}</Text>
              </View>
              <Text style={styles.scoreValue}>{p.score}</Text>
            </View>
          );
        })}
      </View>

      {isHost ? (
        <View style={styles.buttonRow}>
          <PrimaryButton label="Next Round" onPress={nextRound} style={styles.flexButton} />
          <PrimaryButton label="End Game" onPress={endGame} variant="secondary" style={styles.flexButton} />
        </View>
      ) : (
        <Text style={styles.waitingHint}>Waiting for the host to continue…</Text>
      )}
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
    marginBottom: spacing.sm,
  },
  list: {
    maxHeight: 240,
  },
  listContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardWinner: {
    borderWidth: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  answerLabel: {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  votes: {
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  answerText: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },
  sourceNote: {
    fontFamily: fonts.monoRegular,
    fontSize: 10,
    color: colors.textFaint,
    marginTop: 4,
  },
  scoreboardTitle: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  scoreboard: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderColor: colors.border,
    borderWidth: 2,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  scoreNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  scoreName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.text,
  },
  scoreValue: {
    fontFamily: fonts.mono,
    fontSize: 16,
    color: colors.primaryStrong,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  flexButton: {
    flex: 1,
  },
  waitingHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
