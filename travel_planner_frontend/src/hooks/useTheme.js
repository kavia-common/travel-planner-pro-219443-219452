import { useCallback, useEffect, useState } from 'react';

/**
 * PUBLIC_INTERFACE
 * useTheme provides the current theme and a toggle function.
 * Persists preference to localStorage and applies data-theme attribute on <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('theme') : null;
    if (stored === 'light' || stored === 'dark') return stored;
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, toggleTheme, setTheme };
}
