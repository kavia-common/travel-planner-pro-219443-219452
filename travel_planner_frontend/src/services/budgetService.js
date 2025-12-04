import http, { apiBaseUrl } from './http';

const STORAGE_KEY = 'tp_budget_v1';
const SETTINGS_KEY = 'tp_budget_settings_v1';
const PB_KEY = 'tp_planned_budget_v1';

// Helpers for local storage structure
function readAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}
function writeAll(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj || {}));
}
function readSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {};
  } catch {
    return {};
  }
}
function writeSettings(obj) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(obj || {}));
}
function readPlannedBudget() {
  try {
    return JSON.parse(localStorage.getItem(PB_KEY)) || {};
  } catch {
    return {};
  }
}
function writePlannedBudget(obj) {
  localStorage.setItem(PB_KEY, JSON.stringify(obj || {}));
}

function getTripArray(tripId) {
  const all = readAll();
  const key = String(tripId);
  if (!Array.isArray(all[key])) all[key] = [];
  return { all, key };
}

function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * PUBLIC_INTERFACE
 * listExpenses
 * Returns promise of expenses array for a given tripId. HTTP-first then local fallback.
 */
export async function listExpenses(tripId) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.get(`/trips/${encodeURIComponent(tripId)}/budget/expenses`);
      if (res?.data) return res.data;
    } catch (e) {
      // fall back to local
      // eslint-disable-next-line no-console
      console.warn('listExpenses HTTP failed, using local', e);
    }
  }
  const { all, key } = getTripArray(tripId);
  writeAll(all);
  return all[key];
}

/**
 * PUBLIC_INTERFACE
 * addExpense
 * Adds an expense. Returns the saved expense.
 */
export async function addExpense(tripId, expense) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.post(`/trips/${encodeURIComponent(tripId)}/budget/expenses`, expense);
      if (res?.data) return res.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('addExpense HTTP failed, using local', e);
    }
  }
  const { all, key } = getTripArray(tripId);
  const saved = { ...expense, id: expense.id || newId() };
  all[key].push(saved);
  writeAll(all);
  return saved;
}

/**
 * PUBLIC_INTERFACE
 * updateExpense
 * Updates an expense by id with patch. Returns the updated record.
 */
export async function updateExpense(tripId, id, patch) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.patch(`/trips/${encodeURIComponent(tripId)}/budget/expenses/${encodeURIComponent(id)}`, patch);
      if (res?.data) return res.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('updateExpense HTTP failed, using local', e);
    }
  }
  const { all, key } = getTripArray(tripId);
  const idx = all[key].findIndex((e) => e.id === id);
  if (idx >= 0) {
    all[key][idx] = { ...all[key][idx], ...patch, id };
    writeAll(all);
    return all[key][idx];
  }
  throw new Error('Expense not found');
}

/**
 * PUBLIC_INTERFACE
 * removeExpense
 * Removes an expense by id.
 */
export async function removeExpense(tripId, id) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      await http.delete(`/trips/${encodeURIComponent(tripId)}/budget/expenses/${encodeURIComponent(id)}`);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('removeExpense HTTP failed, using local', e);
    }
  }
  const { all, key } = getTripArray(tripId);
  const filtered = all[key].filter((e) => e.id !== id);
  all[key] = filtered;
  writeAll(all);
  return true;
}

/**
 * PUBLIC_INTERFACE
 * getPlannedBudget
 * Returns number or null
 */
export async function getPlannedBudget(tripId) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.get(`/trips/${encodeURIComponent(tripId)}/budget/planned`);
      if (res?.data?.plannedBudget !== undefined) return Number(res.data.plannedBudget);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('getPlannedBudget HTTP failed, using local', e);
    }
  }
  const all = readPlannedBudget();
  const key = String(tripId);
  return all[key] ?? null;
}

/**
 * PUBLIC_INTERFACE
 * setPlannedBudget
 * Sets planned budget
 */
export async function setPlannedBudget(tripId, value) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.post(`/trips/${encodeURIComponent(tripId)}/budget/planned`, { plannedBudget: value });
      if (res?.data?.plannedBudget !== undefined) return Number(res.data.plannedBudget);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('setPlannedBudget HTTP failed, using local', e);
    }
  }
  const all = readPlannedBudget();
  const key = String(tripId);
  all[key] = Number(value);
  writePlannedBudget(all);
  return all[key];
}

/**
 * PUBLIC_INTERFACE
 * getSettings
 * Returns settings object for the trip (e.g., baseCurrency).
 */
export async function getSettings(tripId) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.get(`/trips/${encodeURIComponent(tripId)}/budget/settings`);
      if (res?.data) return res.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('getSettings HTTP failed, using local', e);
    }
  }
  const all = readSettings();
  const key = String(tripId);
  return all[key] || { baseCurrency: 'USD' };
}

/**
 * PUBLIC_INTERFACE
 * setSettings
 * Saves settings object for the trip.
 */
export async function setSettings(tripId, settings) {
  const base = process.env.REACT_APP_API_BASE || apiBaseUrl;
  if (base) {
    try {
      const res = await http.post(`/trips/${encodeURIComponent(tripId)}/budget/settings`, settings);
      if (res?.data) return res.data;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('setSettings HTTP failed, using local', e);
    }
  }
  const all = readSettings();
  const key = String(tripId);
  all[key] = { ...(all[key] || {}), ...(settings || {}) };
  writeSettings(all);
  return all[key];
}
