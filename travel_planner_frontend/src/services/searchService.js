import tripsService from './tripsService';
import itineraryService from './itineraryService';
import packingService from './packingService';
import { listExpenses as budgetListExpenses } from './budgetService';
import placesService from './placesService';
import http from './http';

/**
 * Simple in-memory scorer for search results:
 * exact match > prefix > substring; then rank by recency if date-like fields exist.
 */

// Helpers
const norm = (s) => (s || '').toString().toLowerCase();
const nowTs = Date.now();

// PUBLIC_INTERFACE
export function scoreMatch(query, ...fields) {
  /** Compute a score for a query against provided string fields. */
  const q = norm(query);
  if (!q) return 0;
  let best = 0;
  for (const f of fields) {
    const v = norm(f);
    if (!v) continue;
    if (v === q) {
      best = Math.max(best, 1000); // exact
    } else if (v.startsWith(q)) {
      best = Math.max(best, 600); // prefix
    } else if (v.includes(q)) {
      best = Math.max(best, 300); // substring
    }
  }
  return best;
}

function recencyBoost(dateLike) {
  if (!dateLike) return 0;
  const ts = typeof dateLike === 'number' ? dateLike : Date.parse(dateLike);
  if (!ts || Number.isNaN(ts)) return 0;
  // Newer gets small positive boost; cap boost to avoid overpowering match score
  const days = Math.max(0, (nowTs - ts) / (1000 * 60 * 60 * 24));
  return Math.max(0, 100 - Math.min(100, days)); // 0..100
}

function buildCancellable() {
  let cancelled = false;
  return {
    cancel: () => {
      cancelled = true;
    },
    get cancelled() {
      return cancelled;
    },
  };
}

// Try HTTP endpoints if any exist; otherwise fallback to services/list hooks
async function safeHttpGet(path) {
  try {
    const res = await http.get(path);
    return res?.data || null;
  } catch (_e) {
    return null;
  }
}

async function listTrips() {
  const httpTrips = await safeHttpGet('/trips');
  if (httpTrips && Array.isArray(httpTrips)) return httpTrips;
  // Fallback to tripsService
  try {
    const local = await tripsService.list();
    return local || [];
  } catch {
    return [];
  }
}

async function listItineraryAcrossTrips(trips) {
  // Try HTTP aggregation endpoint if present
  const httpItems = await safeHttpGet('/itinerary');
  if (httpItems && Array.isArray(httpItems)) return httpItems;

  // Fallback: aggregate per trip
  const all = [];
  for (const t of trips) {
    try {
      const items = await itineraryService.listByTrip(t.id);
      (items || []).forEach((it) => all.push({ ...it, tripId: t.id }));
    } catch {
      // ignore
    }
  }
  return all;
}

async function listPackingAcrossTrips(trips) {
  const httpItems = await safeHttpGet('/packing');
  if (httpItems && Array.isArray(httpItems)) return httpItems;

  const all = [];
  for (const t of trips) {
    try {
      const cats = await packingService.listByTrip(t.id);
      // flatten: categories -> items
      (cats || []).forEach((cat) => {
        (cat.items || []).forEach((it) =>
          all.push({ ...it, category: cat.name || cat.category || 'General', tripId: t.id })
        );
      });
    } catch {
      // ignore
    }
  }
  return all;
}

async function listExpensesAcrossTrips(trips) {
  const httpItems = await safeHttpGet('/budget/expenses');
  if (httpItems && Array.isArray(httpItems)) return httpItems;

  const all = [];
  for (const t of trips) {
    try {
      const items = await budgetListExpenses(t.id);
      (items || []).forEach((exp) => all.push({ ...exp, tripId: t.id }));
    } catch {
      // ignore
    }
  }
  return all;
}

async function listRecentPlaces() {
  // No http endpoint available; use placesService if exists
  try {
    const recent = await placesService.getRecentSaved?.();
    if (recent && Array.isArray(recent)) return recent;
  } catch {
    // ignore
  }
  return [];
}

function annotateType(items, type) {
  return (items || []).map((i) => ({ ...i, __type: type }));
}

function computeTripDisplay(t) {
  const primary = t.name || t.title || 'Trip';
  const secondary =
    t.destination ||
    t.description ||
    [t.startDate, t.endDate].filter(Boolean).join(' - ') ||
    '';
  return { primary, secondary };
}

function computeItineraryDisplay(it) {
  const primary = it.title || it.name || it.place || 'Itinerary';
  const secondary = [it.notes, it.place, it.date].filter(Boolean).join(' • ');
  return { primary, secondary };
}

function computePackingDisplay(p) {
  const primary = p.name || p.item || 'Item';
  const secondary = [p.category, p.quantity ? `x${p.quantity}` : ''].filter(Boolean).join(' • ');
  return { primary, secondary };
}

function computeExpenseDisplay(e) {
  const primary = e.title || e.name || 'Expense';
  const secondary = [e.category, e.amount ? `$${e.amount}` : '', e.date || '']
    .filter(Boolean)
    .join(' • ');
  return { primary, secondary };
}

function computePlaceDisplay(p) {
  const primary = p.name || p.title || 'Place';
  const secondary = [p.address, p.vicinity, p.city, p.country].filter(Boolean).join(' • ');
  return { primary, secondary };
}

/**
 * Index and rank items with simple matching/scoring
 */
function indexAndScore(query, trips, itinerary, places, packing, expenses) {
  const q = norm(query);

  const tripResults = annotateType(trips, 'trip')
    .map((t) => {
      const { primary, secondary } = computeTripDisplay(t);
      const s =
        scoreMatch(q, primary, secondary, t.destination, t.description) + recencyBoost(t.updatedAt || t.startDate);
      return { ...t, primary, secondary, score: s, url: `/trips/${t.id}` };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const itiResults = annotateType(itinerary, 'itinerary')
    .map((it) => {
      const { primary, secondary } = computeItineraryDisplay(it);
      const s =
        scoreMatch(q, primary, secondary, it.title, it.place, it.notes) + recencyBoost(it.date || it.updatedAt);
      return { ...it, primary, secondary, score: s, url: `/trips/${it.tripId}` };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const placeResults = annotateType(places, 'place')
    .map((p) => {
      const { primary, secondary } = computePlaceDisplay(p);
      const s = scoreMatch(q, primary, secondary, p.name, p.address, p.city) + recencyBoost(p.updatedAt);
      return { ...p, primary, secondary, score: s, url: p.url || p.mapsUrl || '#' };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const packingResults = annotateType(packing, 'packing')
    .map((p) => {
      const { primary, secondary } = computePackingDisplay(p);
      const s = scoreMatch(q, primary, secondary, p.name, p.category) + recencyBoost(p.updatedAt);
      return { ...p, primary, secondary, score: s, url: `/trips/${p.tripId}#packing` };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const expenseResults = annotateType(expenses, 'expense')
    .map((e) => {
      const { primary, secondary } = computeExpenseDisplay(e);
      const s = scoreMatch(q, primary, secondary, e.title, e.category) + recencyBoost(e.date || e.updatedAt);
      return { ...e, primary, secondary, score: s, url: `/trips/${e.tripId}#budget` };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    trips: tripResults.slice(0, 8),
    itinerary: itiResults.slice(0, 8),
    places: placeResults.slice(0, 8),
    packing: packingResults.slice(0, 8),
    budget: expenseResults.slice(0, 8),
    all: [...tripResults, ...itiResults, ...placeResults, ...packingResults, ...expenseResults],
  };
}

// Debounce controller
let debounceTimer = null;
let activeController = buildCancellable();

// PUBLIC_INTERFACE
export function cancelActiveSearch() {
  /** Cancel the active debounced search requests. */
  activeController?.cancel?.();
  activeController = buildCancellable();
}

// PUBLIC_INTERFACE
export function debouncedSearch(query, opts = {}) {
  /**
   * Debounced search returning a promise of grouped results.
   * Options: { delay = 300 }
   */
  const delay = typeof opts.delay === 'number' ? opts.delay : 300;
  if (debounceTimer) clearTimeout(debounceTimer);
  cancelActiveSearch();

  return new Promise((resolve) => {
    debounceTimer = setTimeout(async () => {
      if (activeController.cancelled) return resolve({ trips: [], itinerary: [], places: [], packing: [], budget: [], all: [] });
      const trips = await listTrips();
      if (activeController.cancelled) return resolve({ trips: [], itinerary: [], places: [], packing: [], budget: [], all: [] });
      const [itinerary, packing, expenses, places] = await Promise.all([
        listItineraryAcrossTrips(trips),
        listPackingAcrossTrips(trips),
        listExpensesAcrossTrips(trips),
        listRecentPlaces(),
      ]);
      if (activeController.cancelled) return resolve({ trips: [], itinerary: [], places: [], packing: [], budget: [], all: [] });
      const grouped = indexAndScore(query, trips, itinerary, places, packing, expenses);
      resolve(grouped);
    }, delay);
  });
}

// PUBLIC_INTERFACE
export async function runSearch(query) {
  /** Non-debounced search, immediate. */
  const trips = await listTrips();
  const [itinerary, packing, expenses, places] = await Promise.all([
    listItineraryAcrossTrips(trips),
    listPackingAcrossTrips(trips),
    listExpensesAcrossTrips(trips),
    listRecentPlaces(),
  ]);
  return indexAndScore(query, trips, itinerary, places, packing, expenses);
}

export default {
  debouncedSearch,
  runSearch,
  cancelActiveSearch,
};
