export const CATEGORY_ORDER = [
  'noun', 'proper', 'verb', 'adjective', 'adverb', 'pronoun',
  'determiner', 'preposition', 'conjunction', 'interjection', 'number', 'other',
] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  noun: 'Nouns',
  proper: 'Proper Nouns',
  verb: 'Verbs',
  adjective: 'Adjectives',
  adverb: 'Adverbs',
  pronoun: 'Pronouns',
  determiner: 'Determiners',
  preposition: 'Prepositions',
  conjunction: 'Conjunctions',
  interjection: 'Interjections',
  number: 'Numbers',
  other: 'Other',
};
