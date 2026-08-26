# Longbourn Lexicon

Write using only words that appear in Jane Austen's *Pride and Prejudice*.
Check what you write against the vocabulary of the whole novel, or narrow it
down to a hand-picked set of chapters, with live flagging, autocomplete, and
a browsable word bank organized by part of speech.

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
punctuation) against the active vocabulary — either every distinct word in
the novel, or the union of words from whichever chapters you've selected.
Matching is by literal word form, not lemma, so a real Austen word used in
a form she never wrote (e.g. a plural she only ever used as a singular)
will still get flagged.

## Text source

*Pride and Prejudice* by Jane Austen (1813) is in the public domain. The
source text used to build the dataset is Project Gutenberg eBook #1342.
