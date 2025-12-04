import http, { createHttpClient } from './http';
import { env } from '../config/env';

/**
 * Storage key helper for local fallback.
 */
function storageKey(tripId) {
  return `packing:${tripId}`;
}

/**
 * Load packing data from localStorage for a trip.
 */
function loadLocal(tripId) {
  try {
    const raw = localStorage.getItem(storageKey(tripId));
    if (!raw) return { categories: defaultCategories(), items: [] };
    const parsed = JSON.parse(raw);
    // normalize
    return {
      categories: Array.isArray(parsed.categories) ? parsed.categories : defaultCategories(),
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { categories: defaultCategories(), items: [] };
  }
}

/**
 * Save packing data to localStorage.
 */
function saveLocal(tripId, data) {
  try {
    localStorage.setItem(storageKey(tripId), JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

/**
 * Default packing categories.
 */
export function defaultCategories() {
  return ['Essentials', 'Clothing', 'Toiletries', 'Electronics', 'Documents', 'Health', 'Misc'];
}

/**
 * Try HTTP request and fallback to local on error.
 */
async function tryHttp(fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    return await fallback(e);
  }
}

// PUBLIC_INTERFACE
export const packingService = (() => {
  /** Service for packing lists with HTTP-first and localStorage fallback. */
  const client = createHttpClient({ baseUrl: env.httpBase || '' });

  // Shape: { categories: string[], items: Array<{id,name,quantity,notes,packed,category}> }
  async function listByTrip(tripId) {
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured'); // force fallback if no base
        const data = await client.get(`/trips/${tripId}/packing`);
        // Normalize payload from backend
        return {
          categories: Array.isArray(data?.categories) ? data.categories : defaultCategories(),
          items: Array.isArray(data?.items) ? data.items : [],
        };
      },
      async () => {
        return loadLocal(tripId);
      }
    );
  }

  async function persistLocal(tripId, updater) {
    const data = loadLocal(tripId);
    const next = updater(structuredClone(data));
    saveLocal(tripId, next);
    return next;
  }

  async function addItem(tripId, item) {
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured');
        const res = await client.post(`/trips/${tripId}/packing/items`, { body: item });
        return res;
      },
      async () => {
        return persistLocal(tripId, (data) => {
          const id = item.id || String(Date.now() + Math.random());
          const newItem = {
            id,
            name: item.name?.trim() || 'Item',
            quantity: Number(item.quantity || 1),
            notes: item.notes || '',
            packed: !!item.packed,
            category: item.category || data.categories[0] || 'Misc',
          };
          // ensure category exists
          if (!data.categories.includes(newItem.category)) {
            data.categories.push(newItem.category);
          }
          data.items.push(newItem);
          return data;
        });
      }
    );
  }

  async function updateItem(tripId, itemId, patch) {
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured');
        const res = await client.put(`/trips/${tripId}/packing/items/${encodeURIComponent(itemId)}`, { body: patch });
        return res;
      },
      async () => {
        return persistLocal(tripId, (data) => {
          const idx = data.items.findIndex((i) => i.id === itemId);
          if (idx !== -1) {
            const prev = data.items[idx];
            const next = { ...prev, ...patch };
            // ensure category exists if changed
            if (patch.category && !data.categories.includes(patch.category)) {
              data.categories.push(patch.category);
            }
            data.items[idx] = next;
          }
          return data;
        });
      }
    );
  }

  async function removeItem(tripId, itemId) {
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured');
        const res = await client.delete(`/trips/${tripId}/packing/items/${encodeURIComponent(itemId)}`);
        return res;
      },
      async () => {
        return persistLocal(tripId, (data) => {
          data.items = data.items.filter((i) => i.id !== itemId);
          return data;
        });
      }
    );
  }

  async function addCategory(tripId, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return listByTrip(tripId);
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured');
        const res = await client.post(`/trips/${tripId}/packing/categories`, { body: { name: trimmed } });
        return res;
      },
      async () => {
        return persistLocal(tripId, (data) => {
          if (!data.categories.includes(trimmed)) data.categories.push(trimmed);
          return data;
        });
      }
    );
  }

  async function removeCategory(tripId, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) return listByTrip(tripId);
    return tryHttp(
      async () => {
        if (!env.httpBase) throw new Error('No API base configured');
        const res = await client.delete(`/trips/${tripId}/packing/categories/${encodeURIComponent(trimmed)}`);
        return res;
      },
      async () => {
        return persistLocal(tripId, (data) => {
          data.categories = data.categories.filter((c) => c !== trimmed);
          // reassign items to Misc if their category removed
          data.items = data.items.map((it) => (it.category === trimmed ? { ...it, category: 'Misc' } : it));
          if (!data.categories.includes('Misc')) data.categories.push('Misc');
          return data;
        });
      }
    );
  }

  return {
    listByTrip,
    addItem,
    updateItem,
    removeItem,
    addCategory,
    removeCategory,
  };
})();

export default packingService;
