import React, { createContext, useContext, useMemo, useReducer } from 'react';

/**
 * PUBLIC_INTERFACE
 * App-wide state management using Context + Reducer.
 * Holds trips, itineraries by trip, and selectedTrip. Also tracks loading and errors by key.
 */
const initialState = {
  trips: [],
  tripsPage: 1,
  tripsPageSize: 20,
  tripsTotal: 0,
  itineraries: {}, // { [tripId]: { items: [], lastFetched: number } }
  selectedTrip: null,
  draftTemplateTrip: null, // holds a pre-populated trip draft created from a template
  loading: {}, // { [key]: boolean }
  errors: {}, // { [key]: Error|string|null }
};

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TRIPS: 'SET_TRIPS',
  SET_SELECTED_TRIP: 'SET_SELECTED_TRIP',
  SET_ITINERARY: 'SET_ITINERARY',
  UPSERT_TRIP: 'UPSERT_TRIP',
  REMOVE_TRIP: 'REMOVE_TRIP',
  SET_DRAFT_TEMPLATE_TRIP: 'SET_DRAFT_TEMPLATE_TRIP',
  CLEAR_DRAFT_TEMPLATE_TRIP: 'CLEAR_DRAFT_TEMPLATE_TRIP',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING: {
      const { key, value } = action.payload;
      return { ...state, loading: { ...state.loading, [key]: !!value } };
    }
    case ACTIONS.SET_ERROR: {
      const { key, value } = action.payload;
      return { ...state, errors: { ...state.errors, [key]: value || null } };
    }
    case ACTIONS.SET_TRIPS: {
      const { items = [], page = 1, pageSize = 20, total = items.length } = action.payload || {};
      return {
        ...state,
        trips: Array.isArray(items) ? items : [],
        tripsPage: page,
        tripsPageSize: pageSize,
        tripsTotal: total,
      };
    }
    case ACTIONS.UPSERT_TRIP: {
      const trip = action.payload;
      if (!trip || !trip.id) return state;
      const idx = state.trips.findIndex((t) => t.id === trip.id);
      let nextTrips = state.trips;
      if (idx >= 0) {
        nextTrips = [...state.trips];
        nextTrips[idx] = { ...nextTrips[idx], ...trip };
      } else {
        nextTrips = [trip, ...state.trips];
      }
      return { ...state, trips: nextTrips };
    }
    case ACTIONS.REMOVE_TRIP: {
      const id = action.payload;
      if (!id) return state;
      const nextTrips = state.trips.filter((t) => t.id !== id);
      const { [id]: _, ...restItins } = state.itineraries;
      const selectedTrip = state.selectedTrip === id ? null : state.selectedTrip;
      return { ...state, trips: nextTrips, itineraries: restItins, selectedTrip };
    }
    case ACTIONS.SET_SELECTED_TRIP: {
      const { tripId } = action.payload;
      return { ...state, selectedTrip: tripId || null };
    }
    case ACTIONS.SET_ITINERARY: {
      const { tripId, items = [], timestamp = Date.now() } = action.payload || {};
      if (!tripId) return state;
      return {
        ...state,
        itineraries: {
          ...state.itineraries,
          [tripId]: { items: Array.isArray(items) ? items : [], lastFetched: timestamp },
        },
      };
    }
    case ACTIONS.SET_DRAFT_TEMPLATE_TRIP: {
      return {
        ...state,
        draftTemplateTrip: action.payload || null,
      };
    }
    case ACTIONS.CLEAR_DRAFT_TEMPLATE_TRIP: {
      return {
        ...state,
        draftTemplateTrip: null,
      };
    }
    default:
      return state;
  }
}

const StoreContext = createContext(undefined);

/**
 * PUBLIC_INTERFACE
 * StoreProvider wraps the app to provide global state.
 */
export function StoreProvider({ children, initial = initialState }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * useStore exposes the state and dispatch function.
 */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

/**
 * PUBLIC_INTERFACE
 * actionCreators provides typed action helpers to keep components/hooks clean.
 */
export const actionCreators = {
  setLoading: (key, value) => ({ type: ACTIONS.SET_LOADING, payload: { key, value } }),
  setError: (key, value) => ({ type: ACTIONS.SET_ERROR, payload: { key, value } }),
  setTrips: (payload) => ({ type: ACTIONS.SET_TRIPS, payload }),
  upsertTrip: (trip) => ({ type: ACTIONS.UPSERT_TRIP, payload: trip }),
  removeTrip: (tripId) => ({ type: ACTIONS.REMOVE_TRIP, payload: tripId }),
  setSelectedTrip: (tripId) => ({ type: ACTIONS.SET_SELECTED_TRIP, payload: { tripId } }),
  setItinerary: (tripId, items, timestamp) => ({
    type: ACTIONS.SET_ITINERARY,
    payload: { tripId, items, timestamp },
  }),
  setDraftTemplateTrip: (draft) => ({
    type: ACTIONS.SET_DRAFT_TEMPLATE_TRIP,
    payload: draft,
  }),
  clearDraftTemplateTrip: () => ({
    type: ACTIONS.CLEAR_DRAFT_TEMPLATE_TRIP,
  }),
};

export default StoreProvider;
