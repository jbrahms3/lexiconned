# Lexiconned Party

A party game built with Expo/React Native, sharing its vocabulary data with
the [Longbourn Lexicon](../README.md) web app.

Each round opens with a slot-machine-style roll: two page-number reels spin
and land on two independently-picked pages (not necessarily next to each
other) from *Pride and Prejudice* — that pair becomes the round's
vocabulary. A random prompt is paired with it, players take turns answering
using only words found on those pages, everyone's answers are revealed
anonymously, and the group votes for their favorite. Points accumulate
across rounds.

## Pages vs. chapters

`src/state/types.ts` exports `ROUND_SOURCE_MODE`, set to `'pages'` by
default — each round picks `PAGES_PER_ROUND` (2) distinct random pages,
independently of each other, unioning their vocabulary (~550 words
combined, a much smaller pool than a full chapter). Set it to `'chapter'`
to go back to whole-chapter rounds instead — the roll animation adapts
automatically (one reel instead of two). "Pages" are an approximation
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
- `src/theme.ts` — colors and fonts. Each player is assigned one color
  from `PLAYER_COLORS` by join order (`playerColor(index)`), used
  throughout for their name, turn screens, and answer cards.
- `src/state/` — the game reducer (players, rounds, turn order, scoring)
  and its React context.
- `src/screens/` — one screen per game phase (players, rolling, pass-device,
  answer, reveal, vote, round results, final).
- `src/screens/RollingScreen.tsx` — the slot-machine-style roll shown at
  the start of each round: one reel per page (or one for a chapter),
  spinning through random numbers before settling on the actual round
  source that was already picked.
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
