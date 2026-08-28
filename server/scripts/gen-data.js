/**
 * Regenerates src/data/chapters.json, src/data/pages.json from the web
 * app's build/pp_words.json (word identities only — no prose). Mirrors
 * mobile/scripts/gen-data.js so the server picks the same pages/chapters
 * the client displays.
 *
 * Run after rebuilding ../build/pp_words.json:
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

console.log('Wrote chapters.json (' + chapters.length + ' chapters) and pages.json (' + pages.length + ' pages)');
