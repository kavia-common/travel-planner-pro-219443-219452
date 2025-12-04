import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore, actionCreators } from '../state/store';
import { ItineraryService } from '../services/itineraryService';
import wsClient from '../services/ws';
import { env } from '../config/env';
import { isEnabled } from '../flags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * useItinerary interacts with itineraries per tripId and syncs with the global store.
 * Adds optional WebSocket subscription per trip and fallback polling.
 */
export function useItinerary(tripId) {
  const { state, dispatch } = useStore();
  const key = `itinerary.${tripId || 'unknown'}`;
  const pollTimer = useRef(null);

  const setLoading = (v) => dispatch(actionCreators.setLoading(key, v));
  const setError = (e) => dispatch(actionCreators.setError(key, e));

  const items = (tripId && state.itineraries[tripId]?.items) || [];
  const lastFetched = (tripId && state.itineraries[tripId]?.lastFetched) || 0;

  const loadItinerary = useCallback(
    async ({ day } = {}) => {
      if (!tripId) return [];
      setLoading(true);
      setError(null);
      try {
        const res = await ItineraryService.list(tripId, { day });
        const list = Array.isArray(res) ? res : (res.items || res || []);
        dispatch(actionCreators.setItinerary(tripId, list, Date.now()));
        return list;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [tripId, dispatch]
  );

  const addItem = useCallback(
    async (item) => {
      if (!tripId) throw new Error('tripId required');
      const created = await ItineraryService.add(tripId, item);
      // optimistic update: append
      const next = [...items, created];
      dispatch(actionCreators.setItinerary(tripId, next, Date.now()));
      return created;
    },
    [tripId, items, dispatch]
  );

  const updateItem = useCallback(
    async (itemId, patch) => {
      if (!tripId) throw new Error('tripId required');
      const updated = await ItineraryService.update(tripId, itemId, patch);
      const next = items.map((it) => (it.id === itemId ? { ...it, ...updated } : it));
      dispatch(actionCreators.setItinerary(tripId, next, Date.now()));
      return updated;
    },
    [tripId, items, dispatch]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (!tripId) throw new Error('tripId required');
      await ItineraryService.remove(tripId, itemId);
      const next = items.filter((it) => it.id !== itemId);
      dispatch(actionCreators.setItinerary(tripId, next, Date.now()));
    },
    [tripId, items, dispatch]
  );

  // Optional WS subscription and polling fallback scoped to this trip
  useEffect(() => {
    if (!tripId) return undefined;

    const enableWs = !!env.wsBase && isEnabled('liveUpdates');
    let unsubscribe = null;

    // Prime data once
    loadItinerary().catch(() => {});

    function startPolling() {
      if (pollTimer.current) return;
      pollTimer.current = setInterval(() => {
        loadItinerary().catch(() => {});
      }, 15000);
    }
    function stopPolling() {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }

    if (enableWs) {
      wsClient.start();
      // Use per-trip topic convention: itinerary:<tripId>
      const topic = `itinerary:${tripId}`;
      unsubscribe = wsClient.subscribe(topic, () => {
        // On any event, refresh the items to keep consistent
        loadItinerary().catch(() => {});
      });
      // Safety polling even when WS is on
      startPolling();
    } else {
      // No WS: polling only
      startPolling();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, loadItinerary]);

  const loading = !!state.loading[key];
  const error = state.errors[key] || null;

  return useMemo(
    () => ({
      items,
      lastFetched,
      loading,
      error,
      loadItinerary,
      addItem,
      updateItem,
      removeItem,
    }),
    [items, lastFetched, loading, error, loadItinerary, addItem, updateItem, removeItem]
  );
}

export default useItinerary;
