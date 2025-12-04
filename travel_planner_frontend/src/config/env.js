//
// Environment configuration for Travel Planner Frontend
// Provides normalized access to environment variables and sensible defaults.
//

// PUBLIC_INTERFACE
export const env = (() => {
  /** Provide a normalized env object sourced from process.env with defaults and helpers. */
  const {
    REACT_APP_API_BASE,
    REACT_APP_BACKEND_URL,
    REACT_APP_FRONTEND_URL,
    REACT_APP_WS_URL,
    REACT_APP_NODE_ENV,
    REACT_APP_NEXT_TELEMETRY_DISABLED,
    REACT_APP_ENABLE_SOURCE_MAPS,
    REACT_APP_PORT,
    REACT_APP_TRUST_PROXY,
    REACT_APP_LOG_LEVEL,
    REACT_APP_HEALTHCHECK_PATH,
    REACT_APP_FEATURE_FLAGS,
    REACT_APP_EXPERIMENTS_ENABLED,
  } = process.env || {};

  // Base HTTP API URL preference order: REACT_APP_API_BASE -> REACT_APP_BACKEND_URL
  const httpBase =
    (REACT_APP_API_BASE && REACT_APP_API_BASE.trim()) ||
    (REACT_APP_BACKEND_URL && REACT_APP_BACKEND_URL.trim()) ||
    '';

  // Websocket URL
  const wsBase = (REACT_APP_WS_URL && REACT_APP_WS_URL.trim()) || '';

  // Healthcheck path, default to /health (used by HealthService and UI indicators)
  const healthPath = (REACT_APP_HEALTHCHECK_PATH && REACT_APP_HEALTHCHECK_PATH.trim()) || '/health';

  // Log level with default "info"
  const logLevel = (REACT_APP_LOG_LEVEL && REACT_APP_LOG_LEVEL.trim()) || 'info';

  // Node env default to development
  const nodeEnv = (REACT_APP_NODE_ENV && REACT_APP_NODE_ENV.trim()) || 'development';

  // Experiments flag default false
  const experimentsEnabled = String(REACT_APP_EXPERIMENTS_ENABLED || '').toLowerCase() === 'true';

  // Feature flags as comma-separated string: "flagA,flagB=value,flagC"
  // Produces:
  // - set: Set<string> of enabled boolean flags (no explicit value, or value truthy)
  // - map: Map<string, string> for key=value style flags
  function parseFeatureFlags(input) {
    const resultSet = new Set();
    const resultMap = new Map();
    if (!input || typeof input !== 'string') return { set: resultSet, map: resultMap };

    const parts = input
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.includes('=')) {
        const idx = part.indexOf('=');
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        if (key) {
          resultMap.set(key, value);
          // Treat "truthy" string values as boolean enable in set as convenience
          const isTruthy = ['1', 'true', 'yes', 'on', 'enabled'].includes(value.toLowerCase());
          if (isTruthy) resultSet.add(key);
        }
      } else {
        resultSet.add(part);
      }
    }
    return { set: resultSet, map: resultMap };
  }

  const parsedFlags = parseFeatureFlags(REACT_APP_FEATURE_FLAGS || '');

  // Helpers
  const isProd = nodeEnv === 'production';
  const isDev = nodeEnv === 'development';
  const isTest = nodeEnv === 'test';

  return {
    httpBase,
    wsBase,
    healthPath,
    logLevel,
    nodeEnv,
    isProd,
    isDev,
    isTest,
    frontendUrl: REACT_APP_FRONTEND_URL || '',
    port: REACT_APP_PORT || '',
    trustProxy: String(REACT_APP_TRUST_PROXY || '').toLowerCase() === 'true',
    telemetryDisabled: String(REACT_APP_NEXT_TELEMETRY_DISABLED || '').toLowerCase() === 'true',
    enableSourceMaps: String(REACT_APP_ENABLE_SOURCE_MAPS || '').toLowerCase() !== 'false',
    experimentsEnabled,
    rawFeatureFlags: REACT_APP_FEATURE_FLAGS || '',
    parsedFlags,
  };
})();

export default env;
