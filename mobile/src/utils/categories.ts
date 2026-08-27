/**
 * Friendly, plain-language word categories for the mobile word bank —
 * simpler than the fine-grained part-of-speech tags in src/data/pos.json
 * (noun, person, proper, verb, adjective, adverb, pronoun, determiner,
 * preposition, conjunction, interjection, number, other), which are
 * folded down into six groups a party isn't expected to parse a grammar
 * chart to understand.
 */

export const CATEGORY_ORDER = ['things', 'people', 'actions', 'descriptions', 'howWhen', 'everythingElse'] as const;

export type Category = (typeof CATEGORY_ORDER)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  things: 'Things & Places',
  people: 'People',
  actions: 'Actions',
  descriptions: 'Descriptions',
  howWhen: 'How & When',
  everythingElse: 'Everything Else',
};

const FINE_TO_SIMPLE: Record<string, Category> = {
  noun: 'things',
  proper: 'things', // place names and other proper nouns that aren't characters
  person: 'people', // named characters + address-titles (Mr, Mrs, Sir, Lady, ...)
  pronoun: 'people', // I, we, they, us, ...
  verb: 'actions',
  adjective: 'descriptions',
  adverb: 'howWhen',
  determiner: 'everythingElse',
  preposition: 'everythingElse',
  conjunction: 'everythingElse',
  interjection: 'everythingElse',
  number: 'everythingElse',
  other: 'everythingElse',
};

export function simplifyCategory(fineTag: string): Category {
  return FINE_TO_SIMPLE[fineTag] || 'everythingElse';
}
