import * as wsModule from '../ws';

// Mock env and feature flag to enable
jest.mock('../../config/env', () => ({
  env: {
    wsBase: 'ws://localhost/ws',
    logLevel: 'error',
    httpBase: 'http://localhost',
    isProd: false,
    nodeEnv: 'test',
  },
}));
jest.mock('../../flags/featureFlags', () => ({
  isEnabled: (name) => (name === 'liveUpdates' ? true : false),
}));

describe('ws client', () => {
  let origWebSocket;
  let openHandlers = {};
  let instance;

  beforeEach(() => {
    jest.useFakeTimers();
    openHandlers = {};
    origWebSocket = global.WebSocket;
    global.WebSocket = jest.fn().mockImplementation((url) => {
      instance = {
        url,
        readyState: 1,
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null,
        send: jest.fn(),
        close: jest.fn(),
      };
      // simulate open in next tick
      setTimeout(() => instance.onopen && instance.onopen(), 0);
      return instance;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    global.WebSocket = origWebSocket;
    jest.resetAllMocks();
  });

  test('start() attempts connection when enabled', () => {
    wsModule.start();
    expect(global.WebSocket).toHaveBeenCalled();
  });

  test('subscribe() returns an unsubscribe function and does not throw', () => {
    wsModule.start();
    const unsub = wsModule.subscribe('trips', jest.fn());
    expect(typeof unsub).toBe('function');
    unsub();
  });

  test('on close schedules reconnect', () => {
    wsModule.start();
    expect(global.WebSocket).toHaveBeenCalled();
    // simulate close
    instance.onclose && instance.onclose();
    // fast-forward timers to trigger reconnect
    jest.advanceTimersByTime(2000);
    expect(global.WebSocket).toHaveBeenCalledTimes(2);
  });
});
