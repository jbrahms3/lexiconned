# Lexiconned Party

A party game built with Expo/React Native, sharing its vocabulary data with
the [Longbourn Lexicon](../README.md) web app.

Each round: a random prompt is paired with a random vocabulary source from
*Pride and Prejudice* — by default, a random 2-page window (see "Pages vs.
chapters" below). Players take turns answering the prompt using only words
found in that source, everyone's answers are revealed anonymously, and the
group votes for their favorite. Points accumulate across rounds.

## Pages vs. chapters

`src/state/types.ts` exports `ROUND_SOURCE_MODE`, set to `'pages'` by
default — each round uses a random `PAGES_PER_ROUND`-page window (2 pages,
~550 words, a much smaller pool than a full chapter). Set it to `'chapter'`
to go back to whole-chapter rounds instead. "Pages" are an approximation
(~275-word chunks of the running text, not real printed-edition page
numbers) — see the web app's `build/build-data.js` for how they're
generated.

## Current mode: hotseat

Right now the game is **pass-and-play**: one phone is shared between all
players. Add everyone's name on the start screen, then pass the device
between turns as prompted.

**Networked play (each player on their own phone, joined by a room code)
is not built yet.** The interface for it is sketched out in
`src/services/multiplayer.ts` so it can be added later without reworking
the screens — that will need a small realtime backend (e.g. Supabase or
Firebase) to sync state between devices.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `i` / `a` for a
simulator/emulator.

## Project layout

- `App.tsx` — loads fonts, wires the game phases to screens.
- `src/state/` — the game reducer (players, rounds, turn order, scoring)
  and its React context.
- `src/screens/` — one screen per game phase (players, pass-device,
  answer, reveal, vote, round results, final).
- `src/components/` — shared UI: buttons, the prompt card, the word bank
  bottom sheet.
- `src/data/prompts.ts` — the curated prompt list (original, written for
  this game).
- `src/data/chapters.json`, `src/data/pages.json` — per-chapter and
  per-page word lists, generated from `../build/pp_words.json` in the web
  app's repo (word identities only, no prose).
- `src/utils/wordCheck.ts` — tokenizing and validating an answer against
  the round's word list, ported from the web app's logic.
- `src/utils/sourceLabel.ts` — formats a round's source (chapter or page
  range) into the "CHAPTER 12 WORDS ONLY" / "PAGES 45–46 WORDS ONLY" label
  shown on-screen.
- `src/services/multiplayer.ts` — placeholder interface for the future
  networked mode; unused today.

## Regenerating word data

If `../build/pp_words.json` is rebuilt (see the web app's README):

```bash
npm run gen:data
```

This runs `scripts/gen-data.js`, which trims it down to `{ num, words }`
per chapter/page and writes `src/data/chapters.json` and
`src/data/pages.json`.
