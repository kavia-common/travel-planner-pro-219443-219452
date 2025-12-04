/**
 * PUBLIC_INTERFACE
 * useTheme
 * A React hook that manages application theme (light/dark) with:
 * - OS-level preference detection (prefers-color-scheme)
 * - localStorage persistence under key 'app-theme'
 * - writes [data-theme] attribute on document.documentElement for CSS variable switching
 *
 * API:
 *   const { theme, isDark, toggleTheme, setTheme } = useTheme();
 */
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'app-theme';
const DARK = 'dark';
const LIGHT = 'light';

// PUBLIC_INTERFACE
export function useTheme() {
  /** This is a public function. */
  const getPreferred = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === DARK || saved === LIGHT) return saved;
    } catch (_) {
      // ignore storage errors
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? DARK : LIGHT;
    }
    return LIGHT; // default to light
  };

  const [theme, setThemeState] = useState(getPreferred);

  const applyTheme = useCallback((nextTheme) => {
    const root = document.documentElement;
    if (nextTheme === DARK) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, []);

  useEffect(() => {
    // initialize theme on mount
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (_) {
      // ignore
    }

    // subscribe to OS-level changes only if user hasn't chosen explicitly this session
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleChange = (e) => {
      // Only auto-adjust if there is no explicit persisted choice (storage cleared)
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
          const next = e.matches ? DARK : LIGHT;
          setThemeState(next);
          applyTheme(next);
        }
      } catch (_) {
        // ignore
      }
    };
    if (mq && mq.addEventListener) {
      mq.addEventListener('change', handleChange);
      return () => mq.removeEventListener('change', handleChange);
    } else if (mq && mq.addListener) {
      mq.addListener(handleChange);
      return () => mq.removeListener(handleChange);
    }
  }, [applyTheme, theme]);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    applyTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch (_) {
      // ignore
    }
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === DARK ? LIGHT : DARK));
  }, [setTheme]);

  const isDark = useMemo(() => theme === DARK, [theme]);

  return { theme, isDark, toggleTheme, setTheme };
}

export default useTheme;
