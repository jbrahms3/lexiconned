import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { sourceForPlayer } from '../../state/networkTypes';
import { PAGE_COUNT, CHAPTER_COUNT } from '../../state/gameReducer';
import { colors, fonts, playerColor, PLAYER_COLORS, spacing } from '../../theme';
import { RollingReel } from '../../components/RollingReel';
import { RandomIllustration } from '../../components/Illustration';

export function NetworkRollingScreen() {
  const { roomState, playerId } = useNetworkGame();
  const [settledCount, setSettledCount] = useState(0);

  if (!roomState || !playerId) return null;
  const source = sourceForPlayer(roomState, playerId);
  if (!source) return null;

  const isPerPlayer = roomState.sourceMode === 'perPlayer';
  const myIndex = roomState.players.findIndex((p) => p.id === playerId);
  const accent = isPerPlayer ? playerColor(myIndex) : colors.text;

  const reels =
    source.type === 'pages'
      ? source.nums.map((num, i) => ({ key: `page-${i}`, value: num, label: `PAGE ${i + 1}` }))
      : [{ key: 'chapter', value: source.num, label: 'CHAPTER' }];
  const maxValue = source.type === 'pages' ? PAGE_COUNT : CHAPTER_COUNT;

  const unit = source.type === 'pages' ? 'your pages' : 'your chapter';
  const title = isPerPlayer ? `Rolling ${unit}…` : `Rolling for ${source.type === 'pages' ? 'pages' : 'a chapter'}…`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.kicker}>ROUND {roomState.round}</Text>
      <Text style={[styles.title, { color: accent }]}>{title}</Text>

      <RandomIllustration />

      <View style={styles.reelsRow}>
        {reels.map((reel, i) => (
          <RollingReel
            key={reel.key}
            finalValue={reel.value}
            label={reel.label}
            maxValue={maxValue}
            color={isPerPlayer ? accent : PLAYER_COLORS[i % PLAYER_COLORS.length]}
            spinDurationMs={1100 + i * 500}
            onSettle={() => setSettledCount((c) => c + 1)}
          />
        ))}
      </View>

      {settledCount >= reels.length && <Text style={styles.waitHint}>Get ready…</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kicker: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  reelsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
  },
  waitHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textFaint,
    marginTop: spacing.xl,
  },
});
