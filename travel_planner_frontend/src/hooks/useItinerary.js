import { useCallback, useMemo } from 'react';
import { useStore, actionCreators } from '../state/store';
import { ItineraryService } from '../services/itineraryService';

/**
 * PUBLIC_INTERFACE
 * useItinerary interacts with itineraries per tripId and syncs with the global store.
 */
export function useItinerary(tripId) {
  const { state, dispatch } = useStore();
  const key = `itinerary.${tripId || 'unknown'}`;

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
