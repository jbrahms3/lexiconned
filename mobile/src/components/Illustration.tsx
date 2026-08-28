import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radii, spacing } from '../theme';

/**
 * Public-domain illustrations from the 1894 George Allen "Peacock Edition"
 * of Pride and Prejudice, illustrated by Hugh Thomson (1860–1920) — the
 * same illustrated edition this app's word data is sourced from
 * (Project Gutenberg #1342). Published 1894; copyright has long since
 * expired in both the US (pre-1929) and UK (life+70, expired 1990).
 *
 * Just one for now — see mobile/assets/illustrations/ to add more and
 * pick among them at random.
 */
const ILLUSTRATIONS = [
  {
    source: require('../../assets/illustrations/entreaties-of-several.jpg'),
    caption: '“The entreaties of several”',
  },
];

export function RandomIllustration() {
  const pick = ILLUSTRATIONS[Math.floor(Math.random() * ILLUSTRATIONS.length)];
  return (
    <View style={styles.card}>
      <Image source={pick.source} style={styles.image} resizeMode="contain" />
      <Text style={styles.caption}>
        {pick.caption} <Text style={styles.credit}>— Hugh Thomson, 1894</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: radii.sm,
  },
  caption: {
    fontFamily: fonts.bodyItalic,
    fontSize: 12,
    color: colors.textSoft,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  credit: {
    fontFamily: fonts.monoRegular,
    color: colors.textFaint,
  },
});
