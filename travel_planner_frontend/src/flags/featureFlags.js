export const FEATURE_FLAGS = (() => {
  // Parse JSON from REACT_APP_FEATURE_FLAGS if present: e.g., {"TRIP_WIZARD": true}
  let flags = {};
  try {
    const raw = process.env.REACT_APP_FEATURE_FLAGS;
    if (raw) {
      flags = JSON.parse(raw);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Invalid REACT_APP_FEATURE_FLAGS JSON, using defaults.');
  }
  // Defaults for known features in this app
  const defaults = {
    TRIP_WIZARD: true,
    FEATURE_NOTIFICATIONS: true,
    FEATURE_BUDGET: true,
    FEATURE_EXPLORE: true,
    ITINERARY_CALENDAR: true,
  };
  return {
    ...defaults,
    ...flags,
  };
})();

// PUBLIC_INTERFACE
export function isFeatureEnabled(key) {
  /** Check if a feature flag is enabled by key. Defaults to false if unknown. */
  return !!FEATURE_FLAGS[key];
}

// PUBLIC_INTERFACE
export function isEnabled(key) {
  /** Alias used by existing code to check feature flags. */
  return isFeatureEnabled(key);
}

/**
 * Expose named constants and helpers for legacy imports
 */
export const FEATURE_NOTIFICATIONS = FEATURE_FLAGS.FEATURE_NOTIFICATIONS;
export const FEATURE_BUDGET = FEATURE_FLAGS.FEATURE_BUDGET;
export const FEATURE_EXPLORE = FEATURE_FLAGS.FEATURE_EXPLORE;

/**
 * PUBLIC_INTERFACE
 * experimentsOn - returns true if experiments are globally enabled via env.
 * Accepts string values like "true", "1", "yes" (case-insensitive).
 */
export function experimentsOn() {
  const v = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes' || v === 'on';
}

/**
 * PUBLIC_INTERFACE
 * allFlags - returns a snapshot of all feature flags (read-only usage).
 */
export function allFlags() {
  return { ...FEATURE_FLAGS };
}

/**
 * PUBLIC_INTERFACE
 * setOverride - sets/overrides a feature flag value at runtime (session-scoped).
 * This is useful for QA or temporary toggles in the client without redeploy.
 */
export function setOverride(key, value) {
  FEATURE_FLAGS[key] = !!value;
  try {
    // persist in sessionStorage so navigation keeps the override during the session
    const raw = sessionStorage.getItem('FEATURE_FLAGS_OVERRIDES');
    const current = raw ? JSON.parse(raw) : {};
    current[key] = !!value;
    sessionStorage.setItem('FEATURE_FLAGS_OVERRIDES', JSON.stringify(current));
  } catch {
    // ignore persistence failures
  }
}

/**
 * PUBLIC_INTERFACE
 * clearOverride - removes a previously set runtime override for a feature flag.
 */
export function clearOverride(key) {
  try {
    const raw = sessionStorage.getItem('FEATURE_FLAGS_OVERRIDES');
    const current = raw ? JSON.parse(raw) : {};
    if (key in current) {
      delete current[key];
      sessionStorage.setItem('FEATURE_FLAGS_OVERRIDES', JSON.stringify(current));
    }
  } catch {
    // ignore persistence failures
  }
}
