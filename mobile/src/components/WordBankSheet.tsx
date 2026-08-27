import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';
import { CATEGORY_LABELS, CATEGORY_ORDER, Category, simplifyCategory } from '../utils/categories';
import posMap from '../data/pos.json';

interface Props {
  visible: boolean;
  words: string[];
  onSelect: (word: string) => void;
  onClose: () => void;
}

export function WordBankSheet({ visible, words, onSelect, onClose }: Props) {
  const [filter, setFilter] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('things');

  const buckets = useMemo(() => {
    const map: Partial<Record<Category, string[]>> = {};
    const pos = posMap as Record<string, string>;
    words.forEach((w) => {
      const cat = simplifyCategory(pos[w]);
      (map[cat] = map[cat] || []).push(w);
    });
    CATEGORY_ORDER.forEach((cat) => map[cat]?.sort());
    return map;
  }, [words]);

  const availableCategories = useMemo(
    () => CATEGORY_ORDER.filter((cat) => (buckets[cat] || []).length > 0),
    [buckets],
  );

  // Keep the active tab valid whenever the word list (and thus buckets) changes.
  useEffect(() => {
    if (availableCategories.length === 0) return;
    if (!availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableCategories]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = buckets[activeCategory] || [];
    return (q ? list.filter((w) => w.startsWith(q)) : list).slice(0, 400);
  }, [buckets, activeCategory, filter]);

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
            placeholder="Filter this category…"
            placeholderTextColor={colors.textFaint}
            value={filter}
            onChangeText={setFilter}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsRow}
            contentContainerStyle={styles.tabsContent}
          >
            {availableCategories.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <Pressable
                  key={cat}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                  <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                    {(buckets[cat] || []).length}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            data={filtered}
            keyExtractor={(w) => w}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<Text style={styles.emptyText}>No words match in this category.</Text>}
            renderItem={({ item }) => (
              <Pressable style={styles.bubble} onPress={() => onSelect(item)}>
                <Text style={styles.bubbleText}>{item}</Text>
              </Pressable>
            )}
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
    height: '78%',
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
    marginBottom: spacing.sm,
  },
  tabsRow: {
    flexGrow: 0,
    marginBottom: spacing.sm,
  },
  tabsContent: {
    gap: 6,
    paddingBottom: 2,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  tabLabel: {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.textSoft,
  },
  tabCount: {
    fontFamily: fonts.monoRegular,
    fontSize: 11,
    color: colors.textFaint,
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    minWidth: 20,
    textAlign: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  tabLabelActive: {
    color: colors.white,
  },
  tabCountActive: {
    color: colors.text,
    backgroundColor: colors.white,
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
  emptyText: {
    fontFamily: fonts.bodyItalic,
    fontSize: 14,
    color: colors.textFaint,
    paddingTop: spacing.md,
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
