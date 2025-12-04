import React from 'react';
import useTheme from '../../hooks/useTheme';

/**
 * PUBLIC_INTERFACE
 * ThemeToggle
 * A small toggle control to switch between light and dark modes.
 * - Reflects current theme (sun/moon icon)
 * - Accessible button with aria-pressed
 * - Uses CSS variables for colors and smooth transitions
 */
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      onClick={toggleTheme}
      style={{
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
        borderRadius: '999px',
        padding: '6px 10px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'background-color var(--transition-slow), color var(--transition-slow), border-color var(--transition-slow), box-shadow var(--transition-slow)',
        cursor: 'pointer'
      }}
      className="theme-toggle surface"
    >
      <span
        aria-hidden="true"
        style={{
          width: 18, height: 18, display: 'inline-block',
          borderRadius: 4,
          background: isDark ? 'radial-gradient(circle at 30% 30%, #e5e7eb 40%, rgba(229,231,235,0.1) 60%)' : 'radial-gradient(circle at 30% 30%, #f59e0b 45%, rgba(245,158,11,0.2) 65%)',
          boxShadow: isDark ? '0 0 12px rgba(229,231,235,0.25)' : '0 0 10px rgba(245,158,11,0.3)',
          transition: 'all var(--transition-slow)'
        }}
      />
      <span className="text-muted" style={{ fontSize: 13 }}>
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ThemeToggle;
