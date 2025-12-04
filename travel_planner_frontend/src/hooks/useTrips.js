import { useCallback, useMemo } from 'react';
import { useStore, actionCreators } from '../state/store';
import { TripsService } from '../services/tripsService';

/**
 * PUBLIC_INTERFACE
 * useTrips centralizes trips operations, syncing the global store with the TripsService.
 */
export function useTrips() {
  const { state, dispatch } = useStore();
  const keyList = 'trips.list';

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
