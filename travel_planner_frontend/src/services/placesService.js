//
// Places service: search via external provider (Nominatim/Google/Mapbox) or local fallback.
// Provides search(query, opts) and details(placeId).
//

import { env } from '../config/env';
import http from './http';

// PUBLIC_INTERFACE
export const PlacesService = (() => {
  /** Service to search places using configured provider or fallback dataset. */
  const provider = (process.env.REACT_APP_PLACES_PROVIDER || 'openstreetmap').toLowerCase();
  const nominatimUrl =
    process.env.REACT_APP_NOMINATIM_URL?.trim() || 'https://nominatim.openstreetmap.org';
  const googleKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY?.trim();
  const mapboxToken = process.env.REACT_APP_MAPBOX_TOKEN?.trim();

  // Small curated dataset for local fallback (demo)
  const localData = [
    {
      id: 'loc_1',
      name: 'Louvre Museum',
      type: 'museum',
      city: 'Paris',
      country: 'France',
      lat: 48.8606,
      lon: 2.3376,
      address: 'Rue de Rivoli, 75001 Paris, France',
    },
    {
      id: 'loc_2',
      name: 'Eiffel Tower',
      type: 'landmark',
      city: 'Paris',
      country: 'France',
      lat: 48.8584,
      lon: 2.2945,
      address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris, France',
    },
    {
      id: 'loc_3',
      name: 'Metropolitan Museum of Art',
      type: 'museum',
      city: 'New York',
      country: 'USA',
      lat: 40.7794,
      lon: -73.9632,
      address: '1000 5th Ave, New York, NY 10028, USA',
    },
    {
      id: 'loc_4',
      name: 'Golden Gate Bridge',
      type: 'landmark',
      city: 'San Francisco',
      country: 'USA',
      lat: 37.8199,
      lon: -122.4783,
      address: 'Golden Gate Bridge, San Francisco, CA, USA',
    },
    {
      id: 'loc_5',
      name: 'Senso-ji Temple',
      type: 'temple',
      city: 'Tokyo',
      country: 'Japan',
      lat: 35.7148,
      lon: 139.7967,
      address: '2 Chome-3-1 Asakusa, Taito City, Tokyo, Japan',
    },
  ];

  function fuzzyScore(a, b) {
    if (!a || !b) return 0;
    const aa = a.toLowerCase();
    const bb = b.toLowerCase();
    if (aa === bb) return 1;
    if (aa.includes(bb) || bb.includes(aa)) return 0.9;
    // basic token overlap
    const as = new Set(aa.split(/\s+/));
    const bs = new Set(bb.split(/\s+/));
    let hits = 0;
    as.forEach((t) => {
      if (bs.has(t)) hits++;
    });
    return hits / Math.max(as.size, bs.size);
  }

  function mapToUnified(item) {
    // Normalize provider-specific item to unified fields
    return {
      id: item.id || item.place_id || item.osm_id || item.mapbox_id || item.google_id || item.name,
      name: item.name || item.display_name || item.text || item.address?.name || item.address?.attraction || item.address?.neighbourhood || item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state || item.address?.country || 'Unknown',
      type: item.type || item.category || item.class || item.properties?.category || 'poi',
      city:
        item.city ||
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        item.context?.find?.((c) => c.id?.startsWith('place'))?.text ||
        '',
      country:
        item.country ||
        item.address?.country ||
        item.context?.find?.((c) => c.id?.startsWith('country'))?.text ||
        '',
      lat: Number(item.lat || item.latitude || item.center?.[1] || item.geometry?.coordinates?.[1] || 0),
      lon: Number(item.lon || item.lng || item.center?.[0] || item.geometry?.coordinates?.[0] || 0),
      address:
        item.address?.road
          ? `${item.address.road}${item.address.house_number ? ' ' + item.address.house_number : ''}, ${item.address.city || item.address.town || item.address.village || ''}, ${item.address.country || ''}`.trim()
          : item.display_name || item.formatted_address || item.place_name || item.address || '',
      raw: item,
    };
  }

  async function nominatimSearch(query) {
    const url = `${nominatimUrl}/search?format=jsonv2&addressdetails=1&limit=10&q=${encodeURIComponent(
      query
    )}`;
    // Use native fetch via http low-level if available; otherwise window.fetch
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        // Nominatim requires a valid User-Agent and encourages an email in it. Using app URL if available.
        'User-Agent': env.frontendUrl || 'travel-planner-frontend',
      },
    });
    if (!res.ok) throw new Error('Nominatim search failed');
    const data = await res.json();
    return data.map((d) => mapToUnified({ ...d, type: d.type, address: d.address }));
  }

  async function googleSearch(query) {
    if (!googleKey) throw new Error('Google Maps API key missing');
    // Note: For a real app you'd proxy through backend to avoid exposing the key or use Places SDK. Here we do a limited web service call if backend proxies, else fallback.
    throw new Error('Google provider not implemented in demo; use Nominatim or Mapbox');
  }

  async function mapboxSearch(query) {
    if (!mapboxToken) throw new Error('Mapbox token missing');
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query
    )}.json?access_token=${mapboxToken}&limit=10&types=poi,place,locality,neighborhood,address`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Mapbox search failed');
    const data = await res.json();
    return (data.features || []).map((f) =>
      mapToUnified({
        id: f.id,
        name: f.text,
        type: f.properties?.category || 'poi',
        center: f.center,
        geometry: f.geometry,
        place_name: f.place_name,
        context: f.context,
      })
    );
  }

  async function localSearch(query) {
    if (!query) return [];
    const scored = localData
      .map((p) => ({ p, s: Math.max(fuzzyScore(p.name, query), fuzzyScore(`${p.city} ${p.country}`, query)) }))
      .filter(({ s }) => s > 0.2)
      .sort((a, b) => b.s - a.s)
      .slice(0, 10)
      .map(({ p }) => ({ ...p, raw: p }));
    return scored;
  }

  // PUBLIC_INTERFACE
  async function search(query, opts = {}) {
    /** Search places by query. Returns top 10 unified results. */
    const trimmed = (query || '').trim();
    if (!trimmed) return [];
    try {
      if (provider === 'google') {
        return await googleSearch(trimmed);
      } else if (provider === 'mapbox') {
        return await mapboxSearch(trimmed);
      } else {
        // default openstreetmap / nominatim
        return await nominatimSearch(trimmed);
      }
    } catch (e) {
      // Fallback to local dataset on error
      // eslint-disable-next-line no-console
      console.warn('[PlacesService] External provider failed, falling back to local dataset:', e?.message || e);
      return localSearch(trimmed);
    }
  }

  // PUBLIC_INTERFACE
  async function details(placeId) {
    /** Fetch details for a placeId. For fallback/local, returns from local dataset; for nominatim attempt a lookup. */
    if (!placeId) throw new Error('placeId is required');
    // Try local
    const local = localData.find((p) => p.id === placeId);
    if (local) return local;
    // For Nominatim, no simple id lookup without knowing osm type; leaving as best-effort with search by name
    try {
      const results = await search(placeId);
      return results[0] || null;
    } catch {
      return null;
    }
  }

  return {
    search,
    details,
  };
})();

export default PlacesService;
