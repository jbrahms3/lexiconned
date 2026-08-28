// Room codes avoid ambiguous characters (0/O, 1/I/L) so they're easy to read aloud and type.
const ROOM_CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 4;

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function makePlayerId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
