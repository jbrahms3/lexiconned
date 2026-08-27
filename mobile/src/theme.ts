/**
 * Visual language for Lexiconned Party — clean, light, and playful.
 * Bold accent colors (one per player) carry the "party game" energy;
 * the surfaces underneath stay simple and light so the colors pop.
 */

export const colors = {
  bg: '#FCFCFF',
  surface: '#F4F4FA',
  surfaceRaised: '#FFFFFF',
  border: '#E7E7F1',
  text: '#1A1A2E',
  textSoft: '#5C5C72',
  textFaint: '#9494A8',
  primary: '#7C3AED',
  primaryStrong: '#6425D0',
  onPrimary: '#FFFFFF',
  flag: '#EF4444',
  flagBg: 'rgba(239, 68, 68, 0.08)',
  chipBg: '#F0EEFB',
  white: '#FFFFFF',
};

/** One bold color per player, assigned by join order. */
export const PLAYER_COLORS = [
  '#FF5A5F', // coral
  '#2EC4B6', // teal
  '#FFC93C', // gold
  '#7C3AED', // violet
  '#FF6FA5', // pink
  '#3B82F6', // blue
  '#F97316', // orange
  '#10B981', // green
];

export function playerColor(index: number): string {
  return PLAYER_COLORS[index % PLAYER_COLORS.length];
}

export const fonts = {
  display: 'Baloo2_600SemiBold',
  displayBold: 'Baloo2_800ExtraBold',
  displayMedium: 'Baloo2_500Medium',
  body: 'Nunito_500Medium',
  bodyItalic: 'Nunito_500Medium_Italic',
  bodyMedium: 'Nunito_700Bold',
  bodyRegular: 'Nunito_400Regular',
  mono: 'IBMPlexMono_500Medium',
  monoRegular: 'IBMPlexMono_400Regular',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};
