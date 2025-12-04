import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useStore, actionCreators } from '../state/store';
import { TripsService } from '../services/tripsService';
import wsClient from '../services/ws';
import { env } from '../config/env';
import { isEnabled } from '../flags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * useTrips centralizes trips operations, syncing the global store with the TripsService.
 * Adds optional WebSocket live updates when:
 *  - env.wsBase is set (REACT_APP_WS_URL) AND
 *  - feature flag 'liveUpdates' is enabled.
 * Falls back to periodic polling when WS is unavailable.
 */
export function useTrips() {
  const { state, dispatch } = useStore();
  const keyList = 'trips.list';
  const pollTimer = useRef(null);

  const setLoading = (v) => dispatch(actionCreators.setLoading(keyList, v));
  const setError = (e) => dispatch(actionCreators.setError(keyList, e));

  const loadTrips = useCallback(
    async ({ page = state.tripsPage || 1, pageSize = state.tripsPageSize || 20 } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const res = await TripsService.list({ page, pageSize });
        // Expecting res to be either array or { items, total, page, pageSize }
        const payload = Array.isArray(res)
          ? { items: res, page, pageSize, total: res.length }
          : {
              items: res.items || [],
              total: res.total ?? (res.items ? res.items.length : 0),
              page: res.page ?? page,
              pageSize: res.pageSize ?? pageSize,
            };
        dispatch(actionCreators.setTrips(payload));
        return payload;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.tripsPage, state.tripsPageSize]
  );

  const getTrip = useCallback(async (tripId) => {
    if (!tripId) return null;
    try {
      const res = await TripsService.getById(tripId);
      dispatch(actionCreators.upsertTrip(res));
      return res;
    } catch (e) {
      // surface as error state specific to this trip fetch
      dispatch(actionCreators.setError(`trips.get.${tripId}`, e));
      throw e;
    }
  }, [dispatch]);

  const createTrip = useCallback(async (payload) => {
    const created = await TripsService.create(payload);
    dispatch(actionCreators.upsertTrip(created));
    return created;
  }, [dispatch]);

  const updateTrip = useCallback(async (tripId, payload) => {
    const updated = await TripsService.update(tripId, payload);
    dispatch(actionCreators.upsertTrip(updated));
    return updated;
  }, [dispatch]);

  const removeTrip = useCallback(async (tripId) => {
    await TripsService.remove(tripId);
    dispatch(actionCreators.removeTrip(tripId));
  }, [dispatch]);

  const selectTrip = useCallback((tripId) => {
    dispatch(actionCreators.setSelectedTrip(tripId));
  }, [dispatch]);

  // Optional WS subscription and polling fallback
  useEffect(() => {
    const enableWs = !!env.wsBase && isEnabled('liveUpdates');
    let unsubscribe = null;

    // Always ensure at least one polling on mount
    loadTrips().catch(() => {});

    // Setup periodic polling (fallback or alongside WS as safety)
    function startPolling() {
      if (pollTimer.current) return;
      pollTimer.current = setInterval(() => {
        loadTrips().catch(() => {});
      }, 15000); // 15s lightweight polling
    }
    function stopPolling() {
      if (pollTimer.current) {
        clearInterval(pollTimer.current);
        pollTimer.current = null;
      }
    }

    if (enableWs) {
      // Start WS client (no-op if already started)
      wsClient.start();
      // Subscribe to trips topic
      unsubscribe = wsClient.subscribe('trips', (msg) => {
        // Expected events: created|updated|deleted or a payload with full list
        // If backend provides a delta payload:
        //  - For simplicity, re-fetch the list to keep logic centralized and consistent
        loadTrips().catch(() => {});
      });
      // Keep a slower safety polling even with WS in case missed messages
      startPolling();
    } else {
      // No WS available: use polling only
      startPolling();
    }

    return () => {
      if (unsubscribe) unsubscribe();
      stopPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTrips]);

  const loading = !!state.loading[keyList];
  const error = state.errors[keyList] || null;

  const value = useMemo(
    () => ({
      trips: state.trips,
      total: state.tripsTotal,
      page: state.tripsPage,
      pageSize: state.tripsPageSize,
      selectedTrip: state.selectedTrip,
      loading,
      error,
      loadTrips,
      getTrip,
      createTrip,
      updateTrip,
      removeTrip,
      selectTrip,
    }),
    [
      state.trips,
      state.tripsTotal,
      state.tripsPage,
      state.tripsPageSize,
      state.selectedTrip,
      loading,
      error,
      loadTrips,
      getTrip,
      createTrip,
      updateTrip,
      removeTrip,
      selectTrip,
    ]
  );

  return value;
}

export default useTrips;
