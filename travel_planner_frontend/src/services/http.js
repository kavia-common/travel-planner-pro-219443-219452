//
// HTTP client wrapper for Travel Planner Frontend
// Features:
// - Base URL support
// - JSON request/response helpers
// - Timeout via AbortController
// - Error normalization and optional console logging based on env log level
//

import { env } from '../config/env';

// Levels in increasing verbosity
const LEVELS = ['error', 'warn', 'info', 'debug'];

// PUBLIC_INTERFACE
export function createHttpClient({ baseUrl = env.httpBase, defaultHeaders = {}, timeoutMs = 10000 } = {}) {
  /**
   * Create a simple HTTP client using fetch with sensible defaults.
   * - baseUrl: prepended to relative paths
   * - defaultHeaders: merged into every request
   * - timeoutMs: aborts long running requests
   */
  const controllerFactory = () => new AbortController();

  const logAllowed = (level) => LEVELS.indexOf(level) <= LEVELS.indexOf(env.logLevel || 'info');

  const normalizeUrl = (path) => {
    if (!path) return baseUrl || '';
    if (/^https?:\/\//i.test(path)) return path;
    const left = (baseUrl || '').replace(/\/+$/, '');
    const right = String(path).replace(/^\/+/, '');
    return `${left}/${right}`;
  };

  const isJsonContent = (resp) => {
    const ct = resp.headers.get('content-type') || '';
    return ct.includes('application/json');
  };

  async function request(method, path, { headers, query, body, signal } = {}) {
    const url = new URL(normalizeUrl(path));

    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        url.searchParams.set(k, String(v));
      });
    }

    // Build headers; keep Content-Type only if body is present and not FormData
    const finalHeaders = { ...defaultHeaders, ...(headers || {}) };
    const hasJsonBody = body !== undefined && body !== null && !(body instanceof FormData);

    if (hasJsonBody) {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
    }

    const controller = controllerFactory();
    const timeoutId = setTimeout(() => controller.abort('timeout'), timeoutMs);

    // Compose fetch options
    const options = {
      method,
      headers: finalHeaders,
      signal: signal || controller.signal,
      credentials: 'include', // in case backend uses cookies/session
    };

    if (hasJsonBody) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    } else if (body instanceof FormData) {
      options.body = body;
      // Let the browser set multipart boundaries
      delete finalHeaders['Content-Type'];
    }

    try {
      if (logAllowed('debug')) {
        // eslint-disable-next-line no-console
        console.debug('[http] request', { method, url: url.toString(), options });
      }
      const res = await fetch(url.toString(), options);
      clearTimeout(timeoutId);

      const ok = res.ok;
      let payload = null;
      try {
        if (isJsonContent(res)) {
          payload = await res.json();
        } else {
          const text = await res.text();
          payload = text;
        }
      } catch (e) {
        // parsing failed; leave payload null
      }

      if (!ok) {
        const err = new Error('Request failed');
        err.name = 'HttpError';
        err.status = res.status;
        err.statusText = res.statusText;
        err.url = url.toString();
        err.method = method;
        err.payload = payload;
        if (logAllowed('warn')) {
          // eslint-disable-next-line no-console
          console.warn('[http] error', { status: res.status, url: url.toString(), payload });
        }
        throw err;
      }

      if (logAllowed('debug')) {
        // eslint-disable-next-line no-console
        console.debug('[http] response', { status: res.status, url: url.toString(), payload });
      }

      return payload;
    } catch (e) {
      clearTimeout(timeoutId);
      if (e.name === 'AbortError') {
        const err = new Error('Request timed out');
        err.name = 'TimeoutError';
        err.url = url.toString();
        err.method = method;
        if (logAllowed('error')) {
          // eslint-disable-next-line no-console
          console.error('[http] timeout', { url: url.toString(), method });
        }
        throw err;
      }
      if (logAllowed('error')) {
        // eslint-disable-next-line no-console
        console.error('[http] exception', e);
      }
      throw e;
    }
  }

  // PUBLIC_INTERFACE
  async function get(path, options = {}) {
    /** Perform HTTP GET with optional query and headers. */
    return request('GET', path, options);
  }

  // PUBLIC_INTERFACE
  async function post(path, options = {}) {
    /** Perform HTTP POST with optional body and headers. */
    return request('POST', path, options);
  }

  // PUBLIC_INTERFACE
  async function put(path, options = {}) {
    /** Perform HTTP PUT with optional body and headers. */
    return request('PUT', path, options);
  }

  // PUBLIC_INTERFACE
  async function del(path, options = {}) {
    /** Perform HTTP DELETE with optional body and headers. */
    return request('DELETE', path, options);
  }

  return {
    baseUrl,
    get,
    post,
    put,
    delete: del,
    request, // escape hatch
  };
}

// A default exported client using env.httpBase for convenience.
// PUBLIC_INTERFACE
export const http = createHttpClient();

export default http;
