# Lexiconned Party

A party game built with Expo/React Native, sharing its vocabulary data with
the [Longbourn Lexicon](../README.md) web app.

Each round opens with a slot-machine-style roll: page-number reels spin and
land on independently-picked pages (not necessarily next to each other)
from *Pride and Prejudice* — that becomes the round's vocabulary. A random
prompt is paired with it, players take turns answering using only words
found on those pages, everyone's answers are revealed anonymously, and the
group votes for their favorite. Points accumulate across rounds.

By default everyone shares one roll per round (**Same Pages**). Toggle to
**Different Pages** on the players screen and instead each player gets
their own fresh roll right before their turn — the pass-device screen
already shows a roll first, so this just means every hand-off rolls again
instead of reusing the round's source. Voting and reveal screens note that
answers used different pages rather than showing one (now meaningless)
shared source; round results show each answer's own pages underneath it.

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

## Prompt style

The players screen has a Classic / Raunchy toggle (`promptMode` in game
state, `src/data/prompts.ts` vs. `src/data/spicyPrompts.ts`). Raunchy is
18+, original Cards-Against-Humanity-style adult party prompts (exes,
hangovers, bad decisions) — not derived from any other game's actual
cards. Switching modes resets which prompts have already been used, since
the two pools are tracked separately.

## Two ways to play

The first screen offers a choice:

- **Pass & Play** — one phone shared between all players, exactly as
  before: add everyone's name, then pass the device between turns as
  prompted. Fully local; no network needed.
- **Play Online** — each player joins from their own phone with a
  4-character room code, and everyone answers/votes simultaneously
  instead of turn-by-turn. Backed by a small WebSocket server in
  `../server` (see that directory's README for how it works and its
  known limitations — in short: in-memory only, no reconnect beyond
  marking players offline, no auth).

These are two independent code paths with two independent state
containers — `GameContext`/`gameReducer.ts` for Pass & Play (unchanged
from before Online existed), `NetworkGameContext`/the server's `room.ts`
for Online. They share the same word data, prompts, and most visual
components, but the phase machines differ: Pass & Play is turn-by-turn
(`pass-answer` → `answer`, one player at a time), Online is simultaneous
(`answering` holds until every player has submitted, then auto-advances).

`src/config.ts` holds the deployed server's URL
(`EXPO_PUBLIC_WS_URL` overrides it at build time). Online mode is
unusable if that server isn't reachable — Pass & Play doesn't touch it at
all.

## Running it

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android), or press `i` / `a` for a
simulator/emulator.

## Project layout

- `App.tsx` — loads fonts; top-level mode switch (mode-select / Pass & Play
  / Online) plus each mode's own phase-to-screen wiring.
- `src/screens/ModeSelectScreen.tsx` — the very first screen: Pass & Play
  vs Play Online.
- `src/theme.ts` — colors and fonts. Each player is assigned one color
  from `PLAYER_COLORS` by join order (`playerColor(index)`), used
  throughout for their name, turn screens, and answer cards — in both
  modes.
- `src/components/RollingReel.tsx` — the slot-machine-style single reel
  (spins through random numbers, settles on a value); shared by both
  modes' rolling screens.
- `src/components/` — other shared UI: buttons, the prompt card, the word
  bank bottom sheet.
- `src/data/prompts.ts`, `src/data/spicyPrompts.ts` — the two curated
  prompt lists (Classic and 18+ Raunchy, both original, written for this
  game).
- `src/data/chapters.json`, `src/data/pages.json` — per-chapter and
  per-page word lists, generated from `../build/pp_words.json` in the web
  app's repo (word identities only, no prose).
- `src/utils/wordCheck.ts` — tokenizing, validating, and autosuggesting
  against the round's word list, ported from the web app's logic; used by
  both modes' answer screens.
- `src/utils/sourceLabel.ts` — formats a round's source (chapter or page
  range) into the "CHAPTER 12 WORDS ONLY" / "PAGES 45–46 WORDS ONLY" label
  shown on-screen.

**Pass & Play:**

- `src/state/gameReducer.ts`, `src/state/GameContext.tsx`, `src/state/types.ts`
  — the turn-by-turn reducer (players, rounds, turn order, scoring) and
  its React context.
- `src/screens/` — one screen per phase (players, rolling, pass-device,
  answer, reveal, vote, round results, final).

**Online:**

- `src/config.ts` — the deployed server's WebSocket URL.
- `src/services/multiplayer.ts` — the WebSocket client: connects,
  auto-reconnects with backoff, exposes `onState`/`onJoined`/`onError`.
- `src/state/networkTypes.ts` — wire types (`RoomState`, `ClientMessage`,
  `ServerMessage`), duplicated by hand from `../server/src/types.ts` since
  there's no shared package between the two.
- `src/state/NetworkGameContext.tsx` — wraps the WebSocket client in a
  React context (`useNetworkGame()`), persists `{code, playerId}` to
  `AsyncStorage` so relaunching the app can attempt `REJOIN_ROOM`.
- `src/screens/network/` — one screen per room phase: `LobbyScreen`
  (create/join by code), `WaitingRoomScreen` (room code, players, host-only
  settings, Start Game), `NetworkRollingScreen`, `NetworkAnswerScreen`
  (adds a live "X/Y answered" count and a post-submit waiting view),
  `NetworkRevealScreen`, `NetworkVoteScreen`, `NetworkResultsScreen`,
  `NetworkFinalScreen`. Screens that gate on one person's action
  (`START_VOTING`, `NEXT_ROUND`, `END_GAME`) show that control only to
  `isHost`; everyone else sees a "waiting for the host…" message — the
  server enforces the same host check independently, so this is a UI
  nicety, not the actual authorization.
- `../server/` — the backend itself (separate `package.json`, deployed as
  its own Railway service). See its README for the wire protocol and the
  room state machine.

## Regenerating word data

If `../build/pp_words.json` is rebuilt (see the web app's README):

```bash
npm run gen:data
```

This runs `scripts/gen-data.js`, which trims it down to `{ num, words }`
per chapter/page and writes `src/data/chapters.json` and
`src/data/pages.json`.
