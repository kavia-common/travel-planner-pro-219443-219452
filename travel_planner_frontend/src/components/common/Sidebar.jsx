import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar with navigation, trip search, and placeholder trip list */
  const [query, setQuery] = useState('');

  const links = [
    { to: '/', label: 'Overview', end: true },
    { to: '/trips', label: 'My Trips' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/settings', label: 'Settings' },
  ];

  // Placeholder trips for sidebar linking
  const trips = useMemo(
    () => [
      { id: 'paris-2024', name: 'Paris Getaway' },
      { id: 'tokyo-spring', name: 'Tokyo Spring' },
      { id: 'alps-hike', name: 'Alps Hike' },
    ],
    []
  );

  const filtered = trips.filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  const linkStyle = ({ isActive }) => ({
    display: 'block',
    textDecoration: 'none',
    padding: '10px 12px',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
    background: isActive ? 'linear-gradient(90deg, var(--gradient-start), transparent)' : 'transparent',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
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
        padding: '1rem',
      }}
      aria-label="Sidebar navigation"
    >
      <div className="mb-4 text-muted" style={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.6 }}>
        NAVIGATION
      </div>
      <nav>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} end={l.end} className="transition-base" style={linkStyle}>
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 text-muted" style={{ fontWeight: 600, fontSize: 12, letterSpacing: 0.6 }}>
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
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
          }}
        />
      </div>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8, display: 'grid', gap: 6 }}>
        {filtered.length === 0 && (
          <li className="text-muted" style={{ fontSize: 12 }}>
            No trips found.
          </li>
        )}
        {filtered.map((t) => (
          <li key={t.id}>
            <NavLink to={`/trips/${t.id}`} className="transition-base" style={linkStyle}>
              {t.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
