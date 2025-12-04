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

  // PUBLIC_INTERFACE
  /** addItineraryItemFromPlace - convenience to add a place to itinerary on a specific date */
  async addItineraryItemFromPlace(tripId, place, date) {
    if (!tripId) throw new Error('tripId is required');
    if (!place) throw new Error('place is required');
    // Minimal shape expected by backend Itinerary item
    const item = {
      title: place.name || 'Place',
      type: 'place',
      date,
      location: {
        name: place.name || '',
        address: place.address || '',
        city: place.city || '',
        country: place.country || '',
        lat: place.lat || undefined,
        lon: place.lon || undefined,
        placeId: place.id || undefined,
        category: place.type || undefined,
      },
      notes: '',
    };
    return this.add(tripId, item);
  },
};

export default ItineraryService;
