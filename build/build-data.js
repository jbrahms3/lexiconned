/**
 * build-data.js
 *
 * Regenerates build/pp_words.json — the word-list dataset that powers the
 * Longbourn Lexicon app (../index.html). This script does NOT save or ship
 * the novel's prose; it only extracts word identities (unique tokens) plus
 * a best-effort part-of-speech tag for each one.
 *
 * Source text: Pride and Prejudice by Jane Austen (1813), public domain.
 * Project Gutenberg eBook #1342 (George Allen illustrated edition, with
 * preface by George Saintsbury) — https://www.gutenberg.org/ebooks/1342
 *
 * Usage:
 *   npm install
 *   node build-data.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const nlp = require('compromise');

const GUTENBERG_URL = 'https://www.gutenberg.org/files/1342/1342-0.txt';
const OUT_PATH = path.join(__dirname, 'pp_words.json');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchText(res.headers.location).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error('Request failed: ' + res.statusCode));
        return;
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function romanToInt(s) {
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const cur = map[s[i]], next = map[s[i + 1]];
    if (next && cur < next) total -= cur; else total += cur;
  }
  return total;
}

function stripGutenbergBoilerplate(raw) {
  const startMarker = '*** START OF THE PROJECT GUTENBERG EBOOK';
  const endMarker = '*** END OF THE PROJECT GUTENBERG EBOOK';
  let startIdx = raw.indexOf(startMarker);
  startIdx = raw.indexOf('\n', startIdx) + 1;
  const endIdx = raw.indexOf(endMarker);
  return raw.slice(startIdx, endIdx);
}

// Matches "CHAPTER I.", "Chapter XLVI.", and the one-off "Chapter I.]"
// illustration-caption heading that opens this particular edition.
const CHAPTER_RE = /\n\s*(CHAPTER\s+([IVXLCDM]+))\.?\]?\s*\n/gi;

function splitChapters(text) {
  const matches = [...text.matchAll(CHAPTER_RE)];
  const headingStarts = matches.map((m) => m.index).sort((a, b) => a - b);
  const bodyStarts = matches
    .map((m) => ({ num: romanToInt(m[2]), start: m.index + m[0].length }))
    .sort((a, b) => a.start - b.start);

  const endTag = text.indexOf('\n\n\n\n\nTHE END');
  const bookEnd = endTag !== -1 ? endTag : text.length;

  return bodyStarts.map((entry, i) => {
    const end = i + 1 < headingStarts.length ? headingStarts[i + 1] : bookEnd;
    return { num: entry.num, body: text.slice(entry.start, end) };
  }).sort((a, b) => a.num - b.num);
}

// Words-per-"page" for the page-level dataset. There is no real pagination
// in a plain-text source — this just chunks the running word stream into
// fixed-size groups (~275 words, a rough paperback-page average) so a
// smaller-than-a-chapter unit is selectable. Page numbers here are an
// approximation and won't match any specific printed edition.
const WORDS_PER_PAGE = 275;

function buildPages(text) {
  const matches = [...text.matchAll(CHAPTER_RE)];
  const bodyStarts = matches.map((m) => m.index + m[0].length);
  const firstStart = Math.min(...bodyStarts);
  const endTag = text.indexOf('\n\n\n\n\nTHE END');
  const bookEnd = endTag !== -1 ? endTag : text.length;
  const bookBody = text.slice(firstStart, bookEnd);

  const words = tokenize(bookBody);
  const pages = [];
  for (let i = 0; i < words.length; i += WORDS_PER_PAGE) {
    const chunk = words.slice(i, i + WORDS_PER_PAGE);
    pages.push({ num: pages.length + 1, words: Array.from(new Set(chunk)).sort() });
  }
  return pages;
}

const WORD_RE = /[A-Za-z]+(?:['-][A-Za-z]+)*/g;

function tokenize(str) {
  str = str.replace(/[‘’]/g, "'"); // normalize curly apostrophes
  const out = [];
  let m;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(str))) {
    const w = m[0].toLowerCase().replace(/^['-]+|['-]+$/g, '');
    if (w.length > 0) out.push(w);
  }
  return out;
}

// Best-effort part-of-speech bucket for a single isolated word (no sentence
// context, since only word identity — not the surrounding prose — is stored).
const CATEGORY_ORDER = [
  ['ProperNoun', 'proper'],
  ['Pronoun', 'pronoun'],
  ['Determiner', 'determiner'],
  ['Preposition', 'preposition'],
  ['Conjunction', 'conjunction'],
  ['Expression', 'interjection'],
  ['Interjection', 'interjection'],
  ['Negative', 'adverb'],
  ['Adverb', 'adverb'],
  ['Adjective', 'adjective'],
  ['Verb', 'verb'],
  ['Value', 'number'],
  ['Noun', 'noun'],
];

// Curated rather than tagger-detected: compromise's generic first/last-name
// dictionary is unreliable for a specific novel's cast when checked word by
// word with no sentence context — it misses real characters ("Bennet",
// "Kitty", "Bourgh") and flags unrelated common words as names ("Grace",
// "Harmony", "Drew", "Lesson"). This list is the named characters and
// address-titles that actually appear in the text, checked against the
// book's real vocabulary rather than guessed.
const PEOPLE_NAMES = [
  // the Bennets
  'bennet', 'elizabeth', 'eliza', 'lizzy', 'jane', 'mary', 'kitty', 'catherine', 'lydia',
  // the Darcys
  'darcy', 'fitzwilliam', 'georgiana',
  // the Bingleys
  'bingley', 'charles', 'caroline', 'louisa', 'hurst',
  // Wickham
  'wickham', 'george',
  // the Collinses
  'collins', 'william',
  // the Lucases
  'lucas', 'charlotte', 'maria',
  // de Bourgh
  'bourgh', 'anne',
  // the Gardiners and Phillipses
  'gardiner', 'phillips',
  // servants and other named minor characters
  'reynolds', 'nicholls', 'jenkinson', 'denny', 'forster', 'younge',
  'annesley', 'jones', 'morris', 'robinson', 'goulding', 'carter',
  // address-titles that name a specific person
  'mr', 'mrs', 'miss', 'sir', 'lady', 'colonel', 'esq',
];
const PEOPLE_SET = new Set(PEOPLE_NAMES.flatMap((w) => [w, w + "'s"]));

function categorize(word) {
  if (PEOPLE_SET.has(word)) return 'person';
  let tags = [];
  try {
    const j = nlp(word).json();
    if (j[0] && j[0].terms[0]) tags = j[0].terms[0].tags;
  } catch (e) { /* fall through to 'other' */ }
  for (const [tag, cat] of CATEGORY_ORDER) {
    if (tags.includes(tag)) return cat;
  }
  return 'other';
}

async function main() {
  console.log('Fetching', GUTENBERG_URL);
  const raw = await fetchText(GUTENBERG_URL);
  const text = stripGutenbergBoilerplate(raw);
  const chapterBodies = splitChapters(text);
  console.log('Found', chapterBodies.length, 'chapters');

  const bookSet = new Set();
  const chapters = chapterBodies.map(({ num, body }) => {
    const words = tokenize(body);
    const set = new Set(words);
    words.forEach((w) => bookSet.add(w));
    return { num, words: Array.from(set).sort() };
  });

  const book = Array.from(bookSet).sort();
  console.log('Tagging', book.length, 'unique words by part of speech');
  const pos = {};
  book.forEach((w) => { pos[w] = categorize(w); });

  const pages = buildPages(text);
  console.log('Built', pages.length, 'pages of ~' + WORDS_PER_PAGE + ' words each');

  const output = { book, chapters, pos, pages };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output));
  console.log('Wrote', OUT_PATH, '(' + fs.statSync(OUT_PATH).size + ' bytes)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
