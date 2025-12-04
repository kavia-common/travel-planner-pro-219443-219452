import { env } from '../config/env';

const LS_KEY = 'ff_overrides';

function readOverrides() {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LS_KEY) : null;
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function writeOverrides(obj) {
  try {
    if (typeof window === 'undefined') return;
    if (!obj || Object.keys(obj).length === 0) {
      window.localStorage.removeItem(LS_KEY);
      return;
    }
    window.localStorage.setItem(LS_KEY, JSON.stringify(obj));
  } catch {
    // ignore storage write failures
  }
}

// Merge env-parsed flags with overrides
function computeMerged() {
  const baseSet = new Set(env.parsedFlags.set);
  const baseMap = new Map(env.parsedFlags.map);
  const overrides = readOverrides();

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'boolean') {
      if (value) baseSet.add(key);
      else baseSet.delete(key);
    } else {
      const str = String(value);
      baseMap.set(key, str);
      const truthy = ['1', 'true', 'yes', 'on', 'enabled'].includes(str.toLowerCase());
      if (truthy) baseSet.add(key);
    }
  }

  return { set: baseSet, map: baseMap, overrides };
}

let merged = computeMerged();

// PUBLIC_INTERFACE
export function refreshOverrides() {
  /** Recompute merged flags from env + local overrides and return snapshot. */
  merged = computeMerged();
  return allFlags();
}

// PUBLIC_INTERFACE
export function setOverride(flag, value) {
  /** Set a local override (client-only). Pass boolean or string; pass null/undefined to clear. */
  if (!flag) return;
  const current = readOverrides();
  if (value === null || value === undefined) {
    delete current[flag];
  } else {
    current[flag] = value;
  }
  writeOverrides(current);
  refreshOverrides();
}

// PUBLIC_INTERFACE
export function clearOverride(flag) {
  /** Clear a specific flag override. */
  setOverride(flag, null);
}

// PUBLIC_INTERFACE
export function clearAllOverrides() {
  /** Remove all overrides. */
  writeOverrides({});
  refreshOverrides();
}

// PUBLIC_INTERFACE
export function isEnabled(flag) {
  /** Returns true if a boolean feature flag is enabled (merged env + overrides). */
  if (!flag) return false;
  return merged.set.has(flag);
}

// PUBLIC_INTERFACE
export function getFlag(flag, defaultValue = undefined) {
  /** Get a flag's string value from merged map or defaultValue. */
  if (!flag) return defaultValue;
  if (merged.map.has(flag)) return merged.map.get(flag);
  return defaultValue;
}

// PUBLIC_INTERFACE
export function experimentsOn() {
  /** Returns true if experiments are globally enabled via REACT_APP_EXPERIMENTS_ENABLED. */
  return !!env.experimentsEnabled;
}

// PUBLIC_INTERFACE
export function allFlags() {
  /** Returns a snapshot of merged flags and values for inspection/debug. */
  return {
    flags: Array.from(merged.set),
    values: Object.fromEntries(merged.map.entries()),
    experimentsEnabled: env.experimentsEnabled,
    raw: env.rawFeatureFlags,
    overrides: { ...merged.overrides },
  };
}

// PUBLIC_INTERFACE
export const FEATURE_BUDGET = 'FEATURE_BUDGET';

// PUBLIC_INTERFACE
export const isFeatureEnabled = isEnabled;

export default {
  isEnabled,
  isFeatureEnabled,
  getFlag,
  experimentsOn,
  allFlags,
  setOverride,
  clearOverride,
  clearAllOverrides,
  refreshOverrides,
  FEATURE_BUDGET,
};
