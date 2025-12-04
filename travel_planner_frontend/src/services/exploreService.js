import http from './http';
import { getApiBaseUrl } from '../config/env';

/**
 * Explore service to interact with explore-related endpoints.
 * Uses the shared http client and environment-based API base URL.
 */

const API_BASE = getApiBaseUrl();

/**
 * PUBLIC_INTERFACE
 * Search destinations via explore endpoint with query, filters, and pagination.
 * @param {Object} params
 * @param {string} params.q - Search query
 * @param {Object} params.filters - Filters object: { region: string[], budget: string[], season: string[] }
 * @param {number} params.page - Page index (0-based)
 * @param {number} params.limit - Page size
 * @returns {Promise<{items: any[], page: number, total: number, hasMore: boolean}>}
 */
export async function searchExplore({ q = '', filters = {}, page = 0, limit = 20 } = {}) {
  const url = `${API_BASE}/explore/search`;
  // Ensure filters is a plain object and stringify for backend
  const params = {
    q,
    page,
    limit,
    filters: JSON.stringify({
      region: Array.isArray(filters.region) ? filters.region : (filters.region ? [filters.region] : []),
      budget: Array.isArray(filters.budget) ? filters.budget : (filters.budget ? [filters.budget] : []),
      season: Array.isArray(filters.season) ? filters.season : (filters.season ? [filters.season] : []),
    }),
  };
  const res = await http.get(url, { params });
  // Normalize response
  const data = res?.data || {};
  return {
    items: data.items || data.results || [],
    page: data.page ?? page,
    total: data.total ?? (data.items ? data.items.length : 0),
    hasMore: data.hasMore ?? ((data.items || []).length === limit),
  };
}

/**
 * PUBLIC_INTERFACE
 * Get a destination detail by id.
 * @param {string|number} id
 * @returns {Promise<any>}
 */
export async function getDestinationById(id) {
  if (!id && id !== 0) throw new Error('Destination id is required');
  const url = `${API_BASE}/explore/destinations/${encodeURIComponent(id)}`;
  const res = await http.get(url);
  return res?.data ?? null;
}

export default {
  searchExplore,
  getDestinationById,
};
