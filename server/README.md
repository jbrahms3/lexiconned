# Lexiconned Party — server

A small WebSocket backend for the mobile app's **Online** mode: everyone
joins a room by code and plays simultaneously on their own phone (as
opposed to **Pass & Play**, which is fully local and needs no backend at
all).

## How it works

- Plain `ws` over an `http` server (no framework). One `WebSocketServer`
  shared across all rooms; rooms live in an in-memory `Map`, keyed by a
  4-character room code (`src/ids.ts`).
- The server is authoritative: clients send small action messages
  (`SUBMIT_ANSWER`, `SET_PAGES_PER_ROUND`, ...), the server applies them to
  the room's state (`src/room.ts`, structurally similar to the mobile
  app's `gameReducer.ts` but modeling *simultaneous* play instead of
  turn-by-turn pass-and-play) and broadcasts the new state to everyone in
  the room. See `src/types.ts` for the full wire protocol
  (`ClientMessage` / `ServerMessage`).
- Answers are validated server-side against the round's actual word list
  (`src/wordData.ts`) — never trust the client's own validation alone.
- The `'rolling'` phase (page/chapter roll animation) auto-advances to
  `'answering'` after a fixed server-side delay (`ROLLING_DELAY_MS` in
  `src/index.ts`), so every client's roll animation finishes around the
  same time without anyone needing to tap through it.
- `'answering'` auto-advances to `'reveal'` once every player has
  answered; `'voting'` auto-advances to `'results'` once everyone has
  voted. Moving from `'reveal'` to `'voting'`, and from `'results'` to the
  next round or game end, are host-only actions (mirrors the "Start
  Voting" / "Next Round" / "End Game" buttons already in the hotseat app).

## Known v1 limitations

- **In-memory only.** Rooms are lost on redeploy/restart. Fine for a
  live party game where a round is a few minutes; not durable across
  deploys.
- **No reconnect handling beyond marking players offline.** A dropped
  player is marked `connected: false` (and hosting reassigns off them if
  they were host), but the "everyone has answered/voted" auto-advance
  still waits for *all* players, connected or not — a player who closes
  the app mid-round can stall the group. `REJOIN_ROOM` exists so a
  refreshed client can resume their identity in the room, but the client
  doesn't yet call it automatically on reconnect.
- **No persistence, auth, or rate limiting.** Anyone with a room code can
  join; there's no password or private-room concept.

## Running locally

```bash
npm install
npm run dev      # ts-node-dev, auto-restarts on change
```

Or build + run like production:

```bash
npm run build
npm start
```

Listens on `process.env.PORT` (defaults to 8080 locally). A plain `GET /`
returns a one-line health check (room count) — Railway uses this to
confirm the service is up.

## Regenerating word data

If `../build/pp_words.json` is rebuilt (see the web app's README):

```bash
npm run gen:data
```

This mirrors `mobile/scripts/gen-data.js`, writing `src/data/chapters.json`
and `src/data/pages.json`. `src/data/prompts.ts` and
`src/data/spicyPrompts.ts` are plain copies of the mobile app's prompt
lists — if those change, copy them over again by hand (small enough files
that a shared package felt like overkill for three files).

## Deploying

Deployed as its own Railway service (see the repo root's `railway.json`
convention, or just point a new service's root directory at `server/`).
Railway sets `PORT` automatically. No other required environment
variables.
