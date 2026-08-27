import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

interface Props {
  visible: boolean;
  words: string[];
  onSelect: (word: string) => void;
  onClose: () => void;
}

export function WordBankSheet({ visible, words, onSelect, onClose }: Props) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? words.filter((w) => w.startsWith(q)) : words;
    return list.slice(0, 400); // cap render count for scroll performance
  }, [words, filter]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Word Bank</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Text style={styles.close}>Done</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.search}
            placeholder="Filter words…"
            placeholderTextColor={colors.textFaint}
            value={filter}
            onChangeText={setFilter}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.count}>
            {words.length.toLocaleString()} word{words.length === 1 ? '' : 's'} available
            {filter ? ` · showing ${filtered.length}` : ''}
          </Text>
          <FlatList
            data={filtered}
            keyExtractor={(w) => w}
            numColumns={1}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable style={styles.bubble} onPress={() => onSelect(item)}>
                <Text style={styles.bubbleText}>{item}</Text>
              </Pressable>
            )}
            // Wrap bubbles by rendering them in a flex-wrap row via a single
            // "row" content container instead of FlatList's own grid, since
            // words have variable width.
            key="wordbank-list"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: '75%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 20,
    color: colors.text,
  },
  close: {
    fontFamily: fonts.mono,
    fontSize: 13,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  search: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    fontFamily: fonts.bodyItalic,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    marginBottom: spacing.xs,
  },
  count: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textFaint,
    marginBottom: spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingBottom: spacing.lg,
  },
  bubble: {
    backgroundColor: colors.chipBg,
    borderRadius: radii.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bubbleText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.primaryStrong,
  },
});
