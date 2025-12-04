import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { StoreProvider } from '../../state/store';

// Mock services and ws/env/flags
jest.mock('../../services/tripsService', () => ({
  TripsService: {
    list: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock('../../services/itineraryService', () => ({
  ItineraryService: {
    list: jest.fn(),
    add: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  },
}));
jest.mock('../../services/ws', () => ({
  __esModule: true,
  default: { start: jest.fn(), subscribe: jest.fn(() => jest.fn()) },
  start: jest.fn(),
  subscribe: jest.fn(() => jest.fn()),
}));
jest.mock('../../config/env', () => ({
  env: {
    httpBase: 'http://localhost',
    wsBase: 'ws://localhost/ws',
    logLevel: 'error',
    isProd: false,
    nodeEnv: 'test',
  },
}));
jest.mock('../../flags/featureFlags', () => ({
  isEnabled: (name) => (name === 'liveUpdates' ? true : false),
}));

import { TripsService } from '../../services/tripsService';
import { ItineraryService } from '../../services/itineraryService';
import wsClient, { start as wsStart, subscribe as wsSubscribe } from '../../services/ws';
import { useTrips } from '../useTrips';
import { useItinerary } from '../useItinerary';

function wrapper({ children }) {
  return <StoreProvider>{children}</StoreProvider>;
}

describe('useTrips hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(global, 'setInterval');
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('loadTrips sets loading, populates trips, and clears loading', async () => {
    TripsService.list.mockResolvedValueOnce({ items: [{ id: '1', name: 'Trip' }], total: 1, page: 1, pageSize: 20 });

    const { result } = renderHook(() => useTrips(), { wrapper });
    // initial effect triggers loadTrips; flush microtasks
    await act(async () => {});

    expect(result.current.loading).toBe(false);
    expect(result.current.trips).toEqual([{ id: '1', name: 'Trip' }]);
  });

  test('CRUD operations delegate to service and update store', async () => {
    TripsService.list.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });
    TripsService.create.mockResolvedValueOnce({ id: 'c1', name: 'Created' });
    TripsService.update.mockResolvedValueOnce({ id: 'c1', name: 'Updated' });
    TripsService.remove.mockResolvedValueOnce({ ok: true });
    TripsService.getById.mockResolvedValueOnce({ id: 'c1', name: 'Fetched' });

    const { result } = renderHook(() => useTrips(), { wrapper });
    await act(async () => {});

    await act(async () => {
      const created = await result.current.createTrip({ name: 'X' });
      expect(created).toEqual({ id: 'c1', name: 'Created' });
    });
    expect(result.current.trips[0]).toEqual({ id: 'c1', name: 'Created' });

    await act(async () => {
      const updated = await result.current.updateTrip('c1', { name: 'Updated' });
      expect(updated).toEqual({ id: 'c1', name: 'Updated' });
    });
    expect(result.current.trips[0]).toEqual({ id: 'c1', name: 'Updated' });

    await act(async () => {
      const fetched = await result.current.getTrip('c1');
      expect(fetched).toEqual({ id: 'c1', name: 'Fetched' });
    });
    expect(result.current.trips[0]).toEqual({ id: 'c1', name: 'Fetched' });

    await act(async () => {
      await result.current.removeTrip('c1');
    });
    expect(result.current.trips).toEqual([]);
  });

  test('enables ws and subscription when flag and url present', async () => {
    TripsService.list.mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });

    renderHook(() => useTrips(), { wrapper });
    await act(async () => {});

    // wsClient.start called
    expect(wsClient.start || wsStart).toBeDefined();
    expect((wsClient.start || wsStart)).toHaveBeenCalled();
    // subscribe to 'trips'
    expect((wsClient.subscribe || wsSubscribe)).toHaveBeenCalledWith('trips', expect.any(Function));
  });

  test('sets error state when loadTrips throws', async () => {
    TripsService.list.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useTrips(), { wrapper });
    await act(async () => {});
    expect(result.current.error).toBeTruthy();
  });
});

describe('useItinerary hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  test('loadItinerary populates items and clears loading', async () => {
    ItineraryService.list.mockResolvedValueOnce([{ id: 'i1', title: 'Item' }]);
    const { result } = renderHook(() => useItinerary('t1'), { wrapper });
    await act(async () => {});
    expect(result.current.items).toEqual([{ id: 'i1', title: 'Item' }]);
    expect(result.current.loading).toBe(false);
  });

  test('add/update/remove item delegates to service and updates store', async () => {
    ItineraryService.list.mockResolvedValueOnce([]);
    ItineraryService.add.mockResolvedValueOnce({ id: 'a1', title: 'Added' });
    ItineraryService.update.mockResolvedValueOnce({ id: 'a1', title: 'Updated' });
    ItineraryService.remove.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() => useItinerary('t1'), { wrapper });
    await act(async () => {});

    await act(async () => {
      const created = await result.current.addItem({ title: 'X' });
      expect(created).toEqual({ id: 'a1', title: 'Added' });
    });
    expect(result.current.items).toEqual([{ id: 'a1', title: 'Added' }]);

    await act(async () => {
      const updated = await result.current.updateItem('a1', { title: 'Updated' });
      expect(updated).toEqual({ id: 'a1', title: 'Updated' });
    });
    expect(result.current.items).toEqual([{ id: 'a1', title: 'Updated' }]);

    await act(async () => {
      await result.current.removeItem('a1');
    });
    expect(result.current.items).toEqual([]);
  });

  test('enables ws subscription per trip', async () => {
    ItineraryService.list.mockResolvedValueOnce([]);
    renderHook(() => useItinerary('trip-xyz'), { wrapper });
    await act(async () => {});
    expect((wsClient.start || wsStart)).toHaveBeenCalled();
    expect((wsClient.subscribe || wsSubscribe)).toHaveBeenCalledWith('itinerary:trip-xyz', expect.any(Function));
  });

  test('sets error when service throws', async () => {
    ItineraryService.list.mockRejectedValueOnce(new Error('bad'));
    const { result } = renderHook(() => useItinerary('t1'), { wrapper });
    await act(async () => {});
    expect(result.current.error).toBeTruthy();
  });
});
