import http from './http';

/**
 * Trip Service provides CRUD operations for trips.
 * Uses REACT_APP_API_BASE for backend URL configuration.
 */

const API_BASE = process.env.REACT_APP_API_BASE;

// PUBLIC_INTERFACE
export async function getTrip(id) {
  /** Fetch a trip by id */
  const url = `${API_BASE}/trips/${encodeURIComponent(id)}`;
  const res = await http.get(url);
  return res.data;
}

// PUBLIC_INTERFACE
export async function createTrip(payload) {
  /** Create a new trip with given payload */
  const url = `${API_BASE}/trips`;
  const res = await http.post(url, payload);
  return res.data;
}

// PUBLIC_INTERFACE
export async function updateTrip(id, payload) {
  /** Update an existing trip by id with given payload */
  const url = `${API_BASE}/trips/${encodeURIComponent(id)}`;
  const res = await http.put(url, payload);
  return res.data;
}
