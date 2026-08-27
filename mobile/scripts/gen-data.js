/**
 * Regenerates src/data/chapters.json, src/data/pages.json, and
 * src/data/pos.json from the web app's build/pp_words.json (word
 * identities and part-of-speech tags only — no prose).
 *
 * Run after rebuilding ../build/pp_words.json (see the web app's
 * build/build-data.js):
 *
 *   node scripts/gen-data.js
 */
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', '..', 'build', 'pp_words.json');
const data = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

const chapters = data.chapters.map((c) => ({ num: c.num, words: c.words }));
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'chapters.json'),
  JSON.stringify(chapters),
);

const pages = (data.pages || []).map((p) => ({ num: p.num, words: p.words }));
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'pages.json'),
  JSON.stringify(pages),
);

const pos = data.pos || {};
fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'pos.json'),
  JSON.stringify(pos),
);

console.log(
  'Wrote chapters.json (' + chapters.length + ' chapters), pages.json (' + pages.length + ' pages), '
  + 'and pos.json (' + Object.keys(pos).length + ' tagged words)',
);
