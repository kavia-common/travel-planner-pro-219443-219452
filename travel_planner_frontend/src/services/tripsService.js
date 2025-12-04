//
// Trips service: provides functions to interact with trips endpoints
//

import http, { createHttpClient } from './http';
import { env } from '../config/env';

// Use specific base if provided, otherwise default http client
const base = env.httpBase ? createHttpClient({ baseUrl: env.httpBase }) : http;

// PUBLIC_INTERFACE
export const TripsService = {
  /** Fetch list of trips for current user. */
  async list({ page = 1, pageSize = 20 } = {}) {
    return base.get('/api/trips', { query: { page, pageSize } });
  },

  // PUBLIC_INTERFACE
  /** Fetch single trip by id. */
  async getById(tripId) {
    if (!tripId) throw new Error('tripId is required');
    return base.get(`/api/trips/${encodeURIComponent(tripId)}`);
  },

  // PUBLIC_INTERFACE
  /** Create a new trip. */
  async create(payload) {
    return base.post('/api/trips', { body: payload });
  },

  // PUBLIC_INTERFACE
  /** Update an existing trip. */
  async update(tripId, payload) {
    if (!tripId) throw new Error('tripId is required');
    return base.put(`/api/trips/${encodeURIComponent(tripId)}`, { body: payload });
  },

  // PUBLIC_INTERFACE
  /** Delete trip by id. */
  async remove(tripId) {
    if (!tripId) throw new Error('tripId is required');
    return base.delete(`/api/trips/${encodeURIComponent(tripId)}`);
  },
};

export default TripsService;
