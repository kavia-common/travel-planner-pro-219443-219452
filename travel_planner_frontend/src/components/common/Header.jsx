import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

// PUBLIC_INTERFACE
export default function Header() {
  /** Header with app title, nav links, and theme toggle */
  const { theme, toggleTheme } = useTheme();

  const linkStyle = ({ isActive }) => ({
    textDecoration: 'none',
    padding: '6px 10px',
    borderRadius: '8px',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
    background: isActive ? 'linear-gradient(90deg, var(--gradient-start), transparent)' : 'transparent',
    border: '1px solid var(--color-border)',
  });

  return (
    <header
      className="gradient-surface transition-base"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'saturate(180%) blur(8px)',
      }}
      aria-label="Top navigation bar"
    >
      <div className="flex items-center justify-between px-4 p-4" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="flex items-center gap-4">
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
            <strong style={{ fontSize: 18 }}>Travel Planner Pro</strong>
          </Link>
        </div>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li><NavLink to="/" end style={linkStyle}>Dashboard</NavLink></li>
            <li><NavLink to="/trips" style={linkStyle}>Trips</NavLink></li>
            <li><NavLink to="/calendar" style={linkStyle}>Calendar</NavLink></li>
            <li><NavLink to="/settings" style={linkStyle}>Settings</NavLink></li>
          </ul>
        </nav>
        <button
          onClick={toggleTheme}
          className="transition-base"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
          }}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>
    </header>
  );
}
