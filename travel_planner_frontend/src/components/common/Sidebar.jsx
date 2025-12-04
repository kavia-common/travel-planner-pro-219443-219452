import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar with navigation, trip search, and placeholder trip list with icons */
  const [query, setQuery] = useState('');

  const links = [
    { to: '/', label: 'Overview', end: true, icon: '🧭' },
    { to: '/trips', label: 'My Trips', icon: '🧳' },
    { to: '/calendar', label: 'Calendar', icon: '📅' },
    { to: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  // Placeholder trips for sidebar linking
  const trips = useMemo(
    () => [
      { id: 'paris-2024', name: 'Paris Getaway', icon: '🗼' },
      { id: 'tokyo-spring', name: 'Tokyo Spring', icon: '🗾' },
      { id: 'alps-hike', name: 'Alps Hike', icon: '⛰️' },
    ],
    []
  );

  const filtered = trips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  const linkStyle = ({ isActive }) => ({
    display: 'block',
    textDecoration: 'none',
    padding: '10px 12px',
    color: isActive ? '#fff' : 'var(--color-text)',
    background: isActive ? 'linear-gradient(180deg, var(--color-primary-500), var(--color-primary-600))' : 'transparent',
    borderRadius: 'var(--radius-sm)',
    border: isActive ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
  });

  return (
    <aside
      className="surface transition-base"
      style={{
        width: 260,
        minWidth: 220,
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        padding: 'var(--space-4)',
      }}
      aria-label="Sidebar navigation"
    >
      <div className="mb-4 text-muted" style={{ fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: 0.6 }}>
        NAVIGATION
      </div>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className="transition-base" style={linkStyle}>
                <span style={{ marginRight: 8 }} aria-hidden>{l.icon}</span>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 text-muted" style={{ fontWeight: 700, fontSize: 'var(--text-xs)', letterSpacing: 0.6 }}>
        TRIPS
      </div>
      <div className="mt-2" role="search">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search trips..."
          aria-label="Search trips"
          className="transition-base"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
          }}
        />
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, display: 'grid', gap: 6 }}>
        {filtered.length === 0 && (
          <li className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
            No trips found.
          </li>
        )}
        {filtered.map((t) => (
          <li key={t.id}>
            <NavLink to={`/trips/${t.id}`} className="transition-base" style={linkStyle}>
              <span style={{ marginRight: 8 }} aria-hidden>{t.icon}</span>
              {t.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
