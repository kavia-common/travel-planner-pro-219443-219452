import { apiBaseUrl } from './http';

const RATES_CACHE_KEY = 'tp_rates_cache_v1';
const SETTINGS_BASE_CURRENCY_KEY = 'tp_base_currency_v1';

// A tiny default rates map as fallback; values represent conversion to USD as base.
const STATIC_RATES_TO_USD = {
  USD: 1,
  EUR: 1.10,  // 1 EUR = 1.10 USD (example)
  GBP: 1.25,
  JPY: 0.0068,
  AUD: 0.66,
  CAD: 0.73,
};

/**
 * PUBLIC_INTERFACE
 * getSupportedCurrencies
 * Returns a list of currency codes supported by the app.
 */
export function getSupportedCurrencies() {
  return Object.keys(STATIC_RATES_TO_USD);
}

/**
 * PUBLIC_INTERFACE
 * getBaseCurrency
 * Returns the user's preferred base currency from localStorage or 'USD'.
 */
export function getBaseCurrency() {
  return localStorage.getItem(SETTINGS_BASE_CURRENCY_KEY) || 'USD';
}

/**
 * PUBLIC_INTERFACE
 * setBaseCurrency
 * Sets the user's preferred base currency into localStorage.
 */
export function setBaseCurrency(code) {
  localStorage.setItem(SETTINGS_BASE_CURRENCY_KEY, code || 'USD');
}

/**
 * Fetches exchange rates using configured API environment variables if available.
 * Expected env:
 * - REACT_APP_EXCHANGE_RATES_URL (e.g., https://api.exchangerate.host/latest?base=USD)
 * - REACT_APP_EXCHANGE_RATES_API_KEY (optional depending on provider)
 */
async function fetchRatesIfConfigured(base = 'USD') {
  const url = process.env.REACT_APP_EXCHANGE_RATES_URL;
  const apiKey = process.env.REACT_APP_EXCHANGE_RATES_API_KEY;
  if (!url) return null;

  try {
    const suffix = url.includes('?') ? '&' : '?';
    const finalUrl = `${url}${suffix}base=${encodeURIComponent(base)}`;
    const res = await fetch(finalUrl, {
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    });
    if (!res.ok) throw new Error(`Rates HTTP ${res.status}`);
    const data = await res.json();
    if (data && data.rates) {
      return data.rates;
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Rates fetch failed, falling back to static', e);
  }
  return null;
}

async function getRates(base = 'USD') {
  const cacheKey = `${RATES_CACHE_KEY}:${base}`;
  const cachedRaw = localStorage.getItem(cacheKey);
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw);
      // simple 24h cache expiry
      if (Date.now() - parsed.ts < 24 * 3600 * 1000) {
        return parsed.rates;
      }
    } catch {
      // ignore
    }
  }

  // Try HTTP first if configured
  const httpRates = await fetchRatesIfConfigured(base);
  if (httpRates) {
    localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), rates: httpRates }));
    return httpRates;
  }

  // Fallback: derive from STATIC_RATES_TO_USD
  const rates = {};
  const baseToUSD = STATIC_RATES_TO_USD[base] || 1;
  Object.entries(STATIC_RATES_TO_USD).forEach(([code, toUSD]) => {
    // convert so that 1 base = rate[code] code
    // if 1 code = toUSD USD, and 1 base = baseToUSD USD, then 1 base = (toUSD/baseToUSD) code
    rates[code] = toUSD / baseToUSD;
  });
  localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), rates }));
  return rates;
}

/**
 * PUBLIC_INTERFACE
 * convertAmount
 * Converts amount from fromCurrency to toCurrency using rates (HTTP if configured, else static).
 */
export function convertAmount(amount, fromCurrency, toCurrency) {
  const amt = Number(amount);
  if (!Number.isFinite(amt)) return 0;

  if (fromCurrency === toCurrency) return amt;

  // Convert via USD using static map synchronously as immediate fallback
  const fromToUSD = STATIC_RATES_TO_USD[fromCurrency];
  const toToUSD = STATIC_RATES_TO_USD[toCurrency];
  if (fromToUSD && toToUSD) {
    // amount in USD = amt * fromToUSD
    // amount in toCurrency = (amt * fromToUSD) / toToUSD
    return (amt * fromToUSD) / toToUSD;
  }
  return amt; // identity if unknown
}

/**
 * PUBLIC_INTERFACE
 * getRatesAsync
 * Returns a promise that resolves to a rate map for the chosen base currency.
 */
export async function getRatesAsync(baseCurrency) {
  return getRates(baseCurrency || 'USD');
}
