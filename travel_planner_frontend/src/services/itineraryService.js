//
// Itinerary service: provides functions to interact with itinerary endpoints
//

import http, { createHttpClient } from './http';
import { env } from '../config/env';

const base = env.httpBase ? createHttpClient({ baseUrl: env.httpBase }) : http;

// PUBLIC_INTERFACE
export const ItineraryService = {
  /** Get itinerary items for a trip */
  async list(tripId, { day } = {}) {
    if (!tripId) throw new Error('tripId is required');
    return base.get(`/api/trips/${encodeURIComponent(tripId)}/itinerary`, {
      query: day ? { day } : undefined,
    });
  },

  // PUBLIC_INTERFACE
  /** Add an itinerary item to a trip */
  async add(tripId, item) {
    if (!tripId) throw new Error('tripId is required');
    return base.post(`/api/trips/${encodeURIComponent(tripId)}/itinerary`, { body: item });
  },

  // PUBLIC_INTERFACE
  /** Update an itinerary item */
  async update(tripId, itemId, item) {
    if (!tripId) throw new Error('tripId is required');
    if (!itemId) throw new Error('itemId is required');
    return base.put(
      `/api/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}`,
      { body: item }
    );
  },

  // PUBLIC_INTERFACE
  /** Update only the day/date of an itinerary item */
  async updateItemDay(tripId, itemId, newDate) {
    if (!tripId) throw new Error('tripId is required');
    if (!itemId) throw new Error('itemId is required');
    if (!newDate) throw new Error('newDate is required');
    // Prefer PATCH if backend supports; fallback to PUT with partial body accepted
    const path = `/api/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}/day`;
    try {
      return await base.patch(path, { body: { date: newDate } });
    } catch {
      return base.put(
        `/api/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}`,
        { body: { date: newDate } }
      );
    }
  },

  // PUBLIC_INTERFACE
  /** Alias: list itinerary by trip (same as list) */
  async listByTrip(tripId) {
    return this.list(tripId);
  },

  // PUBLIC_INTERFACE
  /** Remove an itinerary item */
  async remove(tripId, itemId) {
    if (!tripId) throw new Error('tripId is required');
    if (!itemId) throw new Error('itemId is required');
    return base.delete(
      `/api/trips/${encodeURIComponent(tripId)}/itinerary/${encodeURIComponent(itemId)}`
    );
  },
};

export default ItineraryService;
