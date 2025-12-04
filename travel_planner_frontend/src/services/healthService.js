//
// Health service: provides a lightweight way to ping backend health/status
//

import { env } from '../config/env';
import { createHttpClient } from './http';

// Build a specific http client for health to ensure base and short timeout
const healthClient = createHttpClient({
  baseUrl: env.httpBase,
  timeoutMs: 5000,
});

// PUBLIC_INTERFACE
export async function pingHealth() {
  /** Ping the backend health endpoint and normalize the response shape. */
  const path = env.healthPath || '/health';
  try {
    const data = await healthClient.get(path);
    // Normalize common shapes: { status: 'ok' } or strings
    let ok = false;
    let details = null;

    if (typeof data === 'string') {
      ok = /ok|healthy|up/i.test(data);
      details = { message: data };
    } else if (data && typeof data === 'object') {
      const status = String(data.status || data.state || '').toLowerCase();
      ok = status ? ['ok', 'up', 'healthy', 'pass', 'passing'].includes(status) : true;
      details = data;
    } else {
      ok = true;
      details = { message: 'No payload' };
    }

    return { ok, details };
  } catch (e) {
    return {
      ok: false,
      details: {
        error: true,
        message: e?.message || 'Health check failed',
        status: e?.status,
        statusText: e?.statusText,
        url: e?.url,
      },
    };
  }
}

// PUBLIC_INTERFACE
export async function getStatusText() {
  /** Convenience method: returns a brief human-readable status string. */
  const res = await pingHealth();
  if (res.ok) return 'Online';
  const code = res.details?.status ? ` (${res.details.status})` : '';
  return `Offline${code}`;
}

const HealthService = { pingHealth, getStatusText };
export default HealthService;
