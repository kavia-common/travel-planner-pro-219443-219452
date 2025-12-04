//
// WebSocket client (optional) with feature-flag gating and auto-reconnect.
//
// This module exposes a small API to manage a single shared WebSocket connection
// to the backend (if enabled). It supports topic-based subscriptions with
// message routing and safe no-op fallbacks when disabled or unavailable.
//
// Usage notes:
// - Connection starts only if env.wsBase is present and feature flag 'liveUpdates' is enabled.
// - Consumers can call subscribe(topic, handler) to receive messages.
// - Messages are expected to be JSON with shape: { type, topic, event, payload }.
//   We route by 'topic' and give the entire message to the handler.
// - The module auto-reconnects with exponential backoff and re-subscribes topics.
// - Sending is supported via send(messageObj) if needed in the future.
//

import { env } from '../config/env';
import { isEnabled } from '../flags/featureFlags';

// Connection gating via env + flag
const WS_URL = env.wsBase;
const LIVE_ENABLED = isEnabled('liveUpdates');

const subscribers = new Map(); // topic -> Set<handler>
let ws = null;
let connecting = false;
let shouldRun = false;
let reconnectAttempts = 0;
let reconnectTimer = null;

// Build URL helper (allows path like '/ws')
function normalizeWsUrl(base) {
  if (!base) return '';
  if (/^wss?:\/\//i.test(base)) return base;
  // If HTTP(S) given by chance, replace scheme
  if (/^https?:\/\//i.test(base)) {
    return base.replace(/^http/i, 'ws');
  }
  // Otherwise assume as-is (host/path)
  return base;
}

// Handle incoming messages and fan out by topic
function handleMessage(ev) {
  let data = null;
  try {
    data = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
  } catch {
    // non-JSON payloads are ignored
    return;
  }
  if (!data) return;
  const topic = data.topic || data.type || 'unknown';

  const set = subscribers.get(topic);
  if (!set || set.size === 0) return;

  // Call all handlers safely
  for (const cb of Array.from(set)) {
    try {
      cb(data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ws] handler error', e);
    }
  }
}

function scheduleReconnect() {
  if (!shouldRun) return;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  reconnectAttempts += 1;
  // Exponential backoff capped at 10s
  const delay = Math.min(10000, 500 * Math.pow(2, reconnectAttempts));
  reconnectTimer = setTimeout(connectInternal, delay);
}

function connectInternal() {
  if (!shouldRun || connecting || ws?.readyState === WebSocket.OPEN) return;
  if (!WS_URL || !LIVE_ENABLED) return;
  const url = normalizeWsUrl(WS_URL);
  if (!url) return;
  connecting = true;

  try {
    ws = new WebSocket(url);
  } catch (e) {
    connecting = false;
    // eslint-disable-next-line no-console
    console.error('[ws] failed constructing WebSocket', e);
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    connecting = false;
    reconnectAttempts = 0;
    // eslint-disable-next-line no-console
    if (env.logLevel === 'debug') console.debug('[ws] connected');

    // Re-subscribe active topics if protocol desires (optional)
    // If backend expects subscription messages, uncomment and implement:
    // for (const topic of subscribers.keys()) {
    //   send({ action: 'subscribe', topic });
    // }
  };

  ws.onmessage = handleMessage;

  ws.onerror = (e) => {
    // eslint-disable-next-line no-console
    if (env.logLevel !== 'error') console.warn('[ws] error', e);
  };

  ws.onclose = () => {
    connecting = false;
    ws = null;
    // eslint-disable-next-line no-console
    if (env.logLevel !== 'error') console.warn('[ws] closed, scheduling reconnect');
    scheduleReconnect();
  };
}

// PUBLIC_INTERFACE
export function start() {
  /** Start the optional WebSocket client if enabled via env+flag. */
  shouldRun = true;
  if (WS_URL && LIVE_ENABLED) {
    connectInternal();
  }
}

// PUBLIC_INTERFACE
export function stop() {
  /** Stop the WebSocket client and clear all timers; connection will not auto-reconnect. */
  shouldRun = false;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  try {
    ws?.close();
  } catch {
    /* ignore */
  }
  ws = null;
}

// PUBLIC_INTERFACE
export function subscribe(topic, handler) {
  /**
   * Subscribe to a topic. Returns an unsubscribe function.
   * Handler receives the full parsed message.
   */
  if (!topic || typeof handler !== 'function') return () => {};
  if (!subscribers.has(topic)) subscribers.set(topic, new Set());
  const set = subscribers.get(topic);
  set.add(handler);

  // Start connection lazily when first subscription occurs
  if (!ws && !connecting && shouldRun === false) {
    // Allow start on-demand
    start();
  }

  return () => {
    const s = subscribers.get(topic);
    if (!s) return;
    s.delete(handler);
    if (s.size === 0) subscribers.delete(topic);
  };
}

// PUBLIC_INTERFACE
export function send(obj) {
  /** Send a JSON message if the socket is open; no-op otherwise. */
  if (!ws || ws.readyState !== WebSocket.OPEN) return false;
  try {
    ws.send(JSON.stringify(obj));
    return true;
  } catch {
    return false;
  }
}

// Expose quick helpers
const wsClient = { start, stop, subscribe, send, enabled: () => !!(WS_URL && LIVE_ENABLED) };
export default wsClient;
