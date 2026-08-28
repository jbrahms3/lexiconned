/**
 * WebSocket client for Online mode. Wraps a single connection to the
 * server (see ../../../server), auto-reconnecting with backoff, and
 * exposes a small pub/sub surface that NetworkGameContext consumes.
 */
import { ClientMessage, ServerMessage, RoomState } from '../state/networkTypes';
import { WS_URL } from '../config';

export type ConnectionStatus = 'connecting' | 'open' | 'closed';

type StateListener = (state: RoomState) => void;
type JoinedListener = (code: string, playerId: string, state: RoomState) => void;
type ErrorListener = (message: string) => void;
type StatusListener = (status: ConnectionStatus) => void;

class MultiplayerClient {
  private ws: WebSocket | null = null;
  private status: ConnectionStatus = 'closed';
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private queue: ClientMessage[] = [];

  private stateListeners = new Set<StateListener>();
  private joinedListeners = new Set<JoinedListener>();
  private errorListeners = new Set<ErrorListener>();
  private statusListeners = new Set<StatusListener>();

  connect() {
    this.shouldReconnect = true;
    this.open();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
    this.setStatus('closed');
  }

  send(msg: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      // Queued and flushed on the next successful connection — covers the
      // brief gap while a reconnect is in flight.
      this.queue.push(msg);
    }
  }

  onState(cb: StateListener): () => void {
    this.stateListeners.add(cb);
    return () => this.stateListeners.delete(cb);
  }

  /** Fires once per successful CREATE_ROOM / JOIN_ROOM / REJOIN_ROOM. */
  onJoined(cb: JoinedListener): () => void {
    this.joinedListeners.add(cb);
    return () => this.joinedListeners.delete(cb);
  }

  onError(cb: ErrorListener): () => void {
    this.errorListeners.add(cb);
    return () => this.errorListeners.delete(cb);
  }

  onStatus(cb: StatusListener): () => void {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private setStatus(status: ConnectionStatus) {
    this.status = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private open() {
    this.setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    this.ws = ws;

    ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('open');
      const pending = this.queue;
      this.queue = [];
      pending.forEach((msg) => ws.send(JSON.stringify(msg)));
    };

    ws.onmessage = (event) => {
      let msg: ServerMessage;
      try {
        msg = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (msg.type === 'JOINED') {
        this.joinedListeners.forEach((cb) => cb(msg.code, msg.playerId, msg.state));
        this.stateListeners.forEach((cb) => cb(msg.state));
      } else if (msg.type === 'STATE') {
        this.stateListeners.forEach((cb) => cb(msg.state));
      } else if (msg.type === 'ERROR') {
        this.errorListeners.forEach((cb) => cb(msg.message));
      }
    };

    ws.onclose = () => {
      this.setStatus('closed');
      if (!this.shouldReconnect) return;
      const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 8000);
      this.reconnectAttempt += 1;
      this.reconnectTimer = setTimeout(() => this.open(), delay);
    };

    ws.onerror = () => {
      // onclose fires right after; reconnect is handled there.
    };
  }
}

export const multiplayerClient = new MultiplayerClient();
