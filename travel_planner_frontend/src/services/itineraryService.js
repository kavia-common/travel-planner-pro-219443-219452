//
// Itinerary service: provides functions to interact with itinerary endpoints
//

import http, { createHttpClient } from './http';
import { env } from '../config/env';
import PlacesService from './placesService';

const base = env.httpBase ? createHttpClient({ baseUrl: env.httpBase }) : http;

function dateKey(d) {
  if (!d) return '';
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  } catch {
    return '';
  }
}

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

  // PUBLIC_INTERFACE
  /** getDailyItinerary - returns an ordered Map<dateKey, items[]> from trip and items */
  getDailyItinerary(input) {
    const items = input?.items || [];
    const m = new Map();
    for (const it of items) {
      const k = dateKey(it.date || it.day || it.startDate);
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(it);
    }
    // sort each day's items by time if present
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => {
        const ta = a.time || a.startTime || '';
        const tb = b.time || b.startTime || '';
        return String(ta).localeCompare(String(tb));
      });
      m.set(k, arr);
    }
    return m;
  },

  // PUBLIC_INTERFACE
  /** getCoordinatesSequenceWithGeocoding - returns [{itemId, lat, lon, title, date}] in order, geocoding when needed with per-trip cache */
  async getCoordinatesSequenceWithGeocoding(trip, items) {
    const seq = [];
    if (!items || items.length === 0) return seq;
    const tripKey = trip?.id || trip?.tripId || 'current';
    const cacheKey = `geo-cache-${tripKey}`;
    let cache = {};
    try {
      cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    } catch { /* ignore */ }

    const saveCache = () => {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(cache));
      } catch { /* ignore */ }
    };

    // ordered by date/time
    const sorted = [...items].sort((a, b) => {
      const da = new Date(a.date || 0).getTime();
      const db = new Date(b.date || 0).getTime();
      if (da !== db) return da - db;
      const ta = a.time || a.startTime || '';
      const tb = b.time || b.startTime || '';
      return String(ta).localeCompare(String(tb));
    });

    for (const it of sorted) {
      let lat = it.location?.lat ?? it.lat;
      let lon = it.location?.lon ?? it.lon;
      let title = it.title || it.location?.name || it.destination || '';
      if ((lat == null || lon == null) && (it.destination || it.location?.name || it.location?.city)) {
        const query = it.destination || it.location?.name || it.location?.city;
        if (cache[query]) {
          lat = cache[query].lat;
          lon = cache[query].lon;
        } else {
          try {
            const results = await PlacesService.search(query);
            if (results && results.length > 0) {
              lat = results[0].lat;
              lon = results[0].lon;
              cache[query] = { lat, lon };
              saveCache();
            }
          } catch {
            // ignore geocode errors
          }
        }
      }
      if (typeof lat === 'number' && typeof lon === 'number' && !Number.isNaN(lat) && !Number.isNaN(lon)) {
        seq.push({ itemId: it.id, lat, lon, title, date: it.date || null, id: it.location?.placeId || it.id });
      }
    }
    return seq;
  },
};

export default ItineraryService;

// PUBLIC_INTERFACE
export function getDailyItinerary(input) {
  /** Exported helper that proxies to ItineraryService.getDailyItinerary for convenience. */
  return ItineraryService.getDailyItinerary(input);
}

// PUBLIC_INTERFACE
export async function getCoordinatesSequenceWithGeocoding(trip, items) {
  /** Exported helper that proxies to ItineraryService.getCoordinatesSequenceWithGeocoding. */
  return ItineraryService.getCoordinatesSequenceWithGeocoding(trip, items);
}
