//
// Feature flags/exflags utility
// Parses REACT_APP_FEATURE_FLAGS and REACT_APP_EXPERIMENTS_ENABLED and exposes helpers.
//

import { env } from '../config/env';

const { set: flagSet, map: flagMap } = env.parsedFlags;

// PUBLIC_INTERFACE
export function isEnabled(flag) {
  /** Returns true if a boolean feature flag is enabled. */
  if (!flag) return false;
  return flagSet.has(flag);
}

// PUBLIC_INTERFACE
export function getFlag(flag, defaultValue = undefined) {
  /** Returns a string value for a feature flag key=value pair, or defaultValue if not present. */
  if (!flag) return defaultValue;
  if (flagMap.has(flag)) return flagMap.get(flag);
  return defaultValue;
}

// PUBLIC_INTERFACE
export function experimentsOn() {
  /** Returns true if experiments are globally enabled via REACT_APP_EXPERIMENTS_ENABLED. */
  return !!env.experimentsEnabled;
}

// PUBLIC_INTERFACE
export function allFlags() {
  /** Returns a snapshot of flag set and map for debugging/inspection purposes. */
  return {
    flags: Array.from(flagSet),
    values: Object.fromEntries(flagMap.entries()),
    experimentsEnabled: env.experimentsEnabled,
    raw: env.rawFeatureFlags,
  };
}

export default {
  isEnabled,
  getFlag,
  experimentsOn,
  allFlags,
};
