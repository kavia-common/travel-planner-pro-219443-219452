export const FEATURE_FLAGS = (() => {
  // Parse JSON or comma-separated flags from REACT_APP_FEATURE_FLAGS
  let flags = {};
  try {
    const raw = process.env.REACT_APP_FEATURE_FLAGS;
    if (raw) {
      if (raw.trim().startsWith('{')) {
        flags = JSON.parse(raw);
      } else {
        const parsed = {};
        raw
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .forEach((pair) => {
            if (pair.includes('=')) {
              const [k, v] = pair.split('=');
              const val = String(v).toLowerCase();
              parsed[k] =
                ['true', '1', 'yes', 'on', 'enabled'].includes(val)
                  ? true
                  : ['false', '0', 'no', 'off', 'disabled'].includes(val)
                  ? false
                  : v;
            } else {
              parsed[pair] = true;
            }
          });
        flags = parsed;
      }
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Invalid REACT_APP_FEATURE_FLAGS value, using defaults.');
  }

  // Defaults for known features in this app
  const defaults = {
    TRIP_WIZARD: true,
    FEATURE_NOTIFICATIONS: true,
    FEATURE_BUDGET: true,
    FEATURE_EXPLORE: true,
    ITINERARY_CALENDAR: true,
    PACKING_LIST: true,
    PLACES_SEARCH: true,
    REMINDERS: true,
    BROWSER_NOTIFICATIONS: true,
    TIMELINE_MAP: true,
    // Global Search feature flag (default true)
    GLOBAL_SEARCH: true,
  };

  // Merge with overrides from sessionStorage (if any)
  try {
    const raw = sessionStorage.getItem('FEATURE_FLAGS_OVERRIDES');
    if (raw) {
      const overrides = JSON.parse(raw);
      Object.assign(defaults, overrides);
    }
  } catch {
    // ignore
  }

  // Also allow dedicated envs to override
  const boolEnv = (key, def) => {
    const v = process.env[`REACT_APP_${key}`];
    if (typeof v === 'undefined') return def;
    const val = String(v).toLowerCase();
    if (['true', '1', 'yes', 'on', 'enabled'].includes(val)) return true;
    if (['false', '0', 'no', 'off', 'disabled'].includes(val)) return false;
    return def;
  };

  defaults.FEATURE_NOTIFICATIONS = boolEnv('FEATURE_NOTIFICATIONS', defaults.FEATURE_NOTIFICATIONS);
  defaults.REMINDERS = boolEnv('REMINDERS', defaults.REMINDERS);
  defaults.BROWSER_NOTIFICATIONS = boolEnv('BROWSER_NOTIFICATIONS', defaults.BROWSER_NOTIFICATIONS);
  defaults.TIMELINE_MAP = boolEnv('TIMELINE_MAP', defaults.TIMELINE_MAP);

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
 * PUBLIC_INTERFACE
 * allFlags - returns a snapshot of all feature flags (read-only usage).
 */
export function allFlags() {
  return { ...FEATURE_FLAGS };
}

// Provide named exports for compatibility with existing imports
export const FEATURE_NOTIFICATIONS = FEATURE_FLAGS.FEATURE_NOTIFICATIONS;
export const FEATURE_BUDGET = FEATURE_FLAGS.FEATURE_BUDGET;
export const FEATURE_EXPLORE = FEATURE_FLAGS.FEATURE_EXPLORE;
export const ITINERARY_CALENDAR = FEATURE_FLAGS.ITINERARY_CALENDAR;
export const PACKING_LIST = FEATURE_FLAGS.PACKING_LIST;
export const TRIP_WIZARD = FEATURE_FLAGS.TRIP_WIZARD;
export const REMINDERS = FEATURE_FLAGS.REMINDERS;
export const BROWSER_NOTIFICATIONS = FEATURE_FLAGS.BROWSER_NOTIFICATIONS;
export const TIMELINE_MAP = FEATURE_FLAGS.TIMELINE_MAP;

// Provide a default export object for legacy imports (backwards compatibility)
const defaultExport = {
  ...FEATURE_FLAGS,
  isFeatureEnabled,
  isEnabled,
  allFlags,
  experimentsOn,
  setOverride,
  clearOverride,
};
export default defaultExport;

/**
 * PUBLIC_INTERFACE
 * experimentsOn - returns true if experiments are globally enabled via env.
 * Accepts string values like "true", "1", "yes", "on".
 */
export function experimentsOn() {
  const v = String(process.env.REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes' || v === 'on' || v === 'enabled';
}

/**
 * PUBLIC_INTERFACE
 * setOverride - sets/overrides a feature flag value at runtime (session-scoped).
 */
export function setOverride(key, value) {
  FEATURE_FLAGS[key] = !!value;
  try {
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
