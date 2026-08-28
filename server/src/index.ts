import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { RoomState, ClientMessage, ServerMessage } from './types';
import { createRoom, joinRoom, applyAction, finishRolling, setConnected, reassignHostIfNeeded, RoomError } from './room';
import { generateRoomCode } from './ids';

const PORT = Number(process.env.PORT) || 8080;
const ROLLING_DELAY_MS = 2600; // must comfortably exceed the client's roll animation duration

const rooms = new Map<string, RoomState>();

interface ClientInfo {
  code: string;
  playerId: string;
}

const clientsByRoom = new Map<string, Set<WebSocket>>();
const infoByClient = new WeakMap<WebSocket, ClientInfo>();
const rollingTimers = new Map<string, ReturnType<typeof setTimeout>>();

function send(ws: WebSocket, msg: ServerMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

function broadcastRoom(code: string) {
  const state = rooms.get(code);
  const sockets = clientsByRoom.get(code);
  if (!state || !sockets) return;
  const msg: ServerMessage = { type: 'STATE', state };
  sockets.forEach((ws) => send(ws, msg));
}

function scheduleRollingAdvance(code: string) {
  const existing = rollingTimers.get(code);
  if (existing) clearTimeout(existing);
  const timer = setTimeout(() => {
    rollingTimers.delete(code);
    const state = rooms.get(code);
    if (!state) return;
    rooms.set(code, finishRolling(state));
    broadcastRoom(code);
  }, ROLLING_DELAY_MS);
  rollingTimers.set(code, timer);
}

function newRoomCode(): string {
  let code = generateRoomCode();
  while (rooms.has(code)) code = generateRoomCode();
  return code;
}

function attachToRoom(ws: WebSocket, code: string, playerId: string) {
  infoByClient.set(ws, { code, playerId });
  if (!clientsByRoom.has(code)) clientsByRoom.set(code, new Set());
  clientsByRoom.get(code)!.add(ws);
}

function handleMessage(ws: WebSocket, raw: string) {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    send(ws, { type: 'ERROR', message: 'Malformed message.' });
    return;
  }

  try {
    if (msg.type === 'CREATE_ROOM') {
      const code = newRoomCode();
      const { state, hostId } = createRoom(code, msg.hostName);
      rooms.set(code, state);
      attachToRoom(ws, code, hostId);
      send(ws, { type: 'JOINED', code, playerId: hostId, state });
      return;
    }

    if (msg.type === 'JOIN_ROOM' || msg.type === 'REJOIN_ROOM') {
      const code = msg.code.trim().toUpperCase();
      const state = rooms.get(code);
      if (!state) {
        send(ws, { type: 'ERROR', message: `No room found with code ${code}.` });
        return;
      }

      if (msg.type === 'REJOIN_ROOM') {
        if (!state.players.some((p) => p.id === msg.playerId)) {
          send(ws, { type: 'ERROR', message: 'That player is not in this room.' });
          return;
        }
        const next = reassignHostIfNeeded(setConnected(state, msg.playerId, true));
        rooms.set(code, next);
        attachToRoom(ws, code, msg.playerId);
        send(ws, { type: 'JOINED', code, playerId: msg.playerId, state: next });
        broadcastRoom(code);
        return;
      }

      const { state: next, playerId } = joinRoom(state, msg.playerName);
      rooms.set(code, next);
      attachToRoom(ws, code, playerId);
      send(ws, { type: 'JOINED', code, playerId, state: next });
      broadcastRoom(code);
      return;
    }

    // Every remaining message type requires an attached room/player.
    const info = infoByClient.get(ws);
    if (!info) {
      send(ws, { type: 'ERROR', message: 'Join or create a room first.' });
      return;
    }
    const state = rooms.get(info.code);
    if (!state) {
      send(ws, { type: 'ERROR', message: 'Room no longer exists.' });
      return;
    }

    if (msg.type === 'LEAVE_ROOM') {
      const next = reassignHostIfNeeded(setConnected(state, info.playerId, false));
      rooms.set(info.code, next);
      clientsByRoom.get(info.code)?.delete(ws);
      infoByClient.delete(ws);
      broadcastRoom(info.code);
      return;
    }

    const next = applyAction(state, info.playerId, msg);
    rooms.set(info.code, next);
    broadcastRoom(info.code);
    if (next.phase === 'rolling') scheduleRollingAdvance(info.code);
  } catch (err) {
    const message = err instanceof RoomError ? err.message : 'Something went wrong.';
    send(ws, { type: 'ERROR', message });
    if (!(err instanceof RoomError)) console.error(err);
  }
}

function handleClose(ws: WebSocket) {
  const info = infoByClient.get(ws);
  if (!info) return;
  clientsByRoom.get(info.code)?.delete(ws);
  const state = rooms.get(info.code);
  if (!state) return;
  const next = reassignHostIfNeeded(setConnected(state, info.playerId, false));
  rooms.set(info.code, next);
  broadcastRoom(info.code);
}

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Lexiconned Party server: ' + rooms.size + ' active room(s)\n');
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  ws.on('message', (data) => handleMessage(ws, data.toString()));
  ws.on('close', () => handleClose(ws));
  ws.on('error', () => handleClose(ws));
});

server.listen(PORT, () => {
  console.log(`Lexiconned Party server listening on :${PORT}`);
});
