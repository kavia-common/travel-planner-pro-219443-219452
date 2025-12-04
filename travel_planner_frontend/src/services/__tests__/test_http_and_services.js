import { createHttpClient } from '../http';
import { TripsService } from '../tripsService';
import { ItineraryService } from '../itineraryService';
import { env } from '../../config/env';

jest.mock('../../config/env', () => ({
  env: {
    httpBase: 'http://api.example.com',
    wsBase: '',
    logLevel: 'error',
    isProd: true,
    nodeEnv: 'test',
  },
}));

describe('http client', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  test('prepends baseUrl for relative paths and sends JSON body', async () => {
    const client = createHttpClient({ baseUrl: 'http://api.example.com' });
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    const res = await client.post('/api/test', { body: { x: 1 } });
    expect(res).toEqual({ ok: true });
    const call = fetch.mock.calls[0];
    expect(call[0]).toBe('http://api.example.com/api/test');
    const options = call[1];
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toMatch(/application\/json/);
    expect(options.body).toBe(JSON.stringify({ x: 1 }));
  });

  test('handles non-JSON response', async () => {
    const client = createHttpClient({ baseUrl: 'http://api.example.com' });
    fetch.mockResolvedValueOnce(new Response('plain', { status: 200, headers: { 'Content-Type': 'text/plain' } }));
    const res = await client.get('/text');
    expect(res).toBe('plain');
  });

  test('throws TimeoutError on timeout', async () => {
    const client = createHttpClient({ baseUrl: 'http://api.example.com', timeoutMs: 1 });
    // Never resolve fetch; it will be aborted by AbortController
    fetch.mockImplementation(() => new Promise(() => {}));
    await expect(client.get('/slow')).rejects.toHaveProperty('name', 'TimeoutError');
  });

  test('throws HttpError on non-ok', async () => {
    const client = createHttpClient({ baseUrl: 'http://api.example.com' });
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'bad' }), { status: 500, headers: { 'Content-Type': 'application/json' } }));
    await expect(client.get('/boom')).rejects.toHaveProperty('name', 'HttpError');
  });
});

describe('TripsService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('list calls /api/trips with paging', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await TripsService.list({ page: 2, pageSize: 5 });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('/api/trips');
    expect(url).toContain('page=2');
    expect(url).toContain('pageSize=5');
  });

  test('getById, create, update, remove call correct endpoints', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await TripsService.getById('t1');
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1');

    await TripsService.create({ name: 'X' });
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips');

    await TripsService.update('t1', { name: 'Y' });
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1');

    await TripsService.remove('t1');
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1');
  });
});

describe('ItineraryService', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  test('list calls /api/trips/:id/itinerary with optional day', async () => {
    fetch.mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    await ItineraryService.list('t1', { day: '2023-01-01' });
    const url = fetch.mock.calls[0][0];
    expect(url).toContain('/api/trips/t1/itinerary');
    expect(url).toContain('day=2023-01-01');
  });

  test('add/update/remove endpoints', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await ItineraryService.add('t1', { title: 'A' });
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1/itinerary');

    await ItineraryService.update('t1', 'i1', { title: 'U' });
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1/itinerary/i1');

    await ItineraryService.remove('t1', 'i1');
    expect(fetch.mock.calls.pop()[0]).toContain('/api/trips/t1/itinerary/i1');
  });
});
