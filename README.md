# Longbourn Lexicon

Write using only words that appear in Jane Austen's *Pride and Prejudice*.
Check what you write against the vocabulary of the whole novel, a
hand-picked set of chapters, or a specific page range, with live flagging,
autocomplete, and a browsable word bank organized by part of speech.

**Live app:** `index.html` — a single self-contained static file, no build
step required to run it. Just open it in a browser.

## What's in this repo

- **`index.html`** — the shippable app. Self-contained: markup, styles,
  script, and the word-list dataset are all inlined in one file.
- **`template.html`** — the same app source, but with the dataset replaced
  by an `__PP_DATA__` placeholder. Edit this file when changing markup,
  styles, or behavior, then rebuild `index.html` (see below).
- **`build/`** — the script that generates the word-list dataset
  (`build/pp_words.json`) from the public-domain text of *Pride and
  Prejudice* (Project Gutenberg eBook #1342). The dataset contains only
  word identities and part-of-speech tags — no prose or passages from the
  novel are stored or shipped anywhere in this repo.
- **`mobile/`** — a companion Expo/React Native party game that reuses this
  same word data (see `mobile/README.md`).

## Pages vs. chapters

"Pages" are an approximation: the source is plain text with no real
pagination, so the dataset chunks the running word stream into ~275-word
groups (roughly a paperback page) and numbers them sequentially. They
won't line up with page numbers in any specific printed edition — they
just give a much smaller unit than a full chapter to select from.

## Rebuilding

Regenerate the dataset (only needed if you want to re-derive it, e.g. after
changing the tokenizer or part-of-speech rules):

```bash
cd build
npm install
node build-data.js
```

Then splice the freshly written `build/pp_words.json` into `template.html`
in place of the `__PP_DATA__` placeholder and save the result as
`index.html`.

## How word-checking works

As you type, each word is checked (case-insensitively, ignoring
punctuation) against the active vocabulary — every distinct word in the
novel, the union of words from whichever chapters you've selected, or the
union of words from your chosen page range. Matching is by literal word
form, not lemma, so a real Austen word used in a form she never wrote (e.g.
a plural she only ever used as a singular) will still get flagged.

## Text source

*Pride and Prejudice* by Jane Austen (1813) is in the public domain. The
source text used to build the dataset is Project Gutenberg eBook #1342.
