import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchExplore, getDestinationById } from '../services/exploreService';
import { useNotifications } from './useNotifications';
import { useTrips } from './useTrips';
import { useItinerary } from './useItinerary';

/**
 * Debounce helper hook
 */
function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * PUBLIC_INTERFACE
 * useExplore manages search query, filters, pagination, selection, and integration with trips/itinerary.
 * Exposes results, loading, error states, and actions including addDestinationToTrip.
 */
export function useExplore(initial = {}) {
  const [query, setQuery] = useState(initial.query || '');
  const [filters, setFilters] = useState({
    region: initial.filters?.region || [],
    budget: initial.filters?.budget || [],
    season: initial.filters?.season || [],
  });
  const [page, setPage] = useState(0);
  const [limit] = useState(20);
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const debouncedQuery = useDebouncedValue(query, 400);
  const debouncedFilters = useDebouncedValue(filters, 400);

  const { notifySuccess, notifyError } = useNotifications();
  const { trips, createTrip } = useTrips();
  const { addItineraryItem } = useItinerary();

  const resetAndSearchRef = useRef(null);

  const resetAndSearch = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    // trigger search through effect by updating page to 0 after reset
  }, []);

  // Keep a stable ref to indicate a "fresh" search after reset
  resetAndSearchRef.current = resetAndSearch;

  const loadPage = useCallback(async (pageToLoad) => {
    setLoading(true);
    setError('');
    try {
      const resp = await searchExplore({
        q: debouncedQuery,
        filters: debouncedFilters,
        page: pageToLoad,
        limit,
      });
      setItems(prev => (pageToLoad === 0 ? resp.items : [...prev, ...resp.items]));
      setHasMore(Boolean(resp.hasMore));
    } catch (err) {
      const msg = err?.message || 'Failed to load explore results';
      setError(msg);
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, debouncedFilters, limit, notifyError]);

  // Trigger search when query/filters change (debounced)
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    loadPage(0);
  }, [debouncedQuery, debouncedFilters, loadPage]);

  // Load more handler for infinite scroll or button
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const next = page + 1;
    setPage(next);
    loadPage(next);
  }, [page, hasMore, loading, loadPage]);

  // PUBLIC_INTERFACE
  const selectDestination = useCallback(async (id) => {
    try {
      setLoading(true);
      const detail = await getDestinationById(id);
      setSelected(detail);
    } catch (e) {
      notifyError('Unable to load destination details');
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  // PUBLIC_INTERFACE
  const addDestinationToTrip = useCallback(async ({ destination, tripId, createNewTripName }) => {
    try {
      let targetTripId = tripId;
      if (!targetTripId && createNewTripName) {
        const newTrip = await createTrip({ name: createNewTripName });
        targetTripId = newTrip?.id;
      }
      if (!targetTripId) {
        throw new Error('Trip not selected');
      }
      // Construct a placeholder itinerary item for the destination
      const item = {
        title: destination?.name || 'Destination',
        notes: `Explore: ${destination?.name || destination?.id || ''}`,
        date: new Date().toISOString().slice(0, 10),
        location: destination?.name || '',
        metadata: {
          exploreId: destination?.id,
          type: 'destination',
        },
      };
      await addItineraryItem(targetTripId, item);
      notifySuccess('Added to trip itinerary');
      return true;
    } catch (e) {
      notifyError(e?.message || 'Failed to add to trip');
      return false;
    }
  }, [addItineraryItem, createTrip, notifyError, notifySuccess]);

  const state = useMemo(() => ({
    query,
    setQuery,
    filters,
    setFilters,
    page,
    items,
    hasMore,
    loading,
    error,
    selected,
    setSelected,
    loadMore,
    selectDestination,
    addDestinationToTrip,
    trips,
  }), [
    query, filters, page, items, hasMore, loading, error, selected,
    loadMore, selectDestination, addDestinationToTrip, trips,
  ]);

  return state;
}

export default useExplore;
