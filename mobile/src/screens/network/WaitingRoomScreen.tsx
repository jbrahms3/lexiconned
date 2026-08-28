import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNetworkGame } from '../../state/NetworkGameContext';
import { colors, fonts, playerColor, radii, spacing } from '../../theme';
import { PrimaryButton } from '../../components/PrimaryButton';

export function WaitingRoomScreen() {
  const { roomState, playerId, isHost, setPagesPerRound, setPromptMode, setSourceMode, startGame, leaveRoom } = useNetworkGame();
  if (!roomState) return null;

  const toggleRow = <T extends string | number>(
    label: string,
    options: { value: T; text: string }[],
    current: T,
    onChange: (v: T) => void,
  ) => (
    <>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.toggleRow}>
        {options.map((opt) => {
          const active = opt.value === current;
          return (
            <Pressable
              key={String(opt.value)}
              disabled={!isHost}
              style={[styles.toggleBtn, active && styles.toggleBtnActive, !isHost && styles.toggleBtnDisabled]}
              onPress={() => onChange(opt.value)}
            >
              <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{opt.text}</Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.kicker}>ROOM CODE</Text>
      <Text style={styles.code}>{roomState.code}</Text>
      <Text style={styles.shareHint}>Share this code so others can join.</Text>

      <Text style={styles.sectionLabel}>PLAYERS ({roomState.players.length})</Text>
      <FlatList
        data={roomState.players}
        keyExtractor={(p) => p.id}
        style={styles.list}
        renderItem={({ item, index }) => (
          <View style={[styles.playerRow, { borderColor: playerColor(index) }]}>
            <View style={styles.playerNameRow}>
              <View style={[styles.dot, { backgroundColor: playerColor(index) }]} />
              <Text style={styles.playerName}>
                {item.name}
                {item.id === roomState.hostId ? '  (host)' : ''}
                {item.id === playerId ? '  — you' : ''}
              </Text>
            </View>
            {!item.connected && <Text style={styles.offline}>offline</Text>}
          </View>
        )}
      />

      {toggleRow('PAGES PER ROUND', [{ value: 1, text: '1 Page' }, { value: 2, text: '2 Pages' }], roomState.pagesPerRound, setPagesPerRound)}
      {toggleRow(
        'PROMPT STYLE',
        [{ value: 'classic', text: 'Classic' }, { value: 'spicy', text: 'Raunchy' }],
        roomState.promptMode,
        setPromptMode,
      )}
      {toggleRow(
        'VOCABULARY SOURCE',
        [{ value: 'shared', text: 'Same Pages' }, { value: 'perPlayer', text: 'Different Pages' }],
        roomState.sourceMode,
        setSourceMode,
      )}

      {isHost ? (
        <PrimaryButton
          label="Start Game"
          onPress={startGame}
          disabled={roomState.players.length < 2}
          style={styles.startButton}
        />
      ) : (
        <Text style={styles.waitingHint}>Waiting for the host to start…</Text>
      )}

      <Text style={styles.leaveLink} onPress={leaveRoom}>
        Leave Room
      </Text>
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
    textAlign: 'center',
  },
  code: {
    fontFamily: fonts.displayBold,
    fontSize: 56,
    letterSpacing: 8,
    color: colors.primary,
    textAlign: 'center',
  },
  shareHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textSoft,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textFaint,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  list: {
    maxHeight: 140,
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
    fontSize: 16,
    color: colors.text,
  },
  offline: {
    fontFamily: fonts.mono,
    fontSize: 10,
    color: colors.flag,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  toggleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleBtnDisabled: {
    opacity: 0.6,
  },
  toggleLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.textSoft,
  },
  toggleLabelActive: {
    color: colors.onPrimary,
  },
  startButton: {
    marginTop: spacing.lg,
  },
  waitingHint: {
    fontFamily: fonts.bodyItalic,
    fontSize: 13,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  leaveLink: {
    fontFamily: fonts.mono,
    fontSize: 11,
    color: colors.flag,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
