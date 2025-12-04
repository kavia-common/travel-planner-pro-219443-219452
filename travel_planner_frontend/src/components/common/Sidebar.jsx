import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Sidebar with placeholder links for future sections */
  const location = useLocation();

  const links = [
    { to: '/', label: 'Overview' },
    { to: '/trips', label: 'My Trips' },
    { to: '/calendar', label: 'Calendar' },
    { to: '/settings', label: 'Settings' },
  ];

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
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="transition-base"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    padding: '10px 12px',
                    color: active ? 'var(--color-primary)' : 'var(--color-text)',
                    background: active ? 'linear-gradient(90deg, var(--gradient-start), transparent)' : 'transparent',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-4 text-muted" style={{ fontSize: 12 }}>
        Placeholder list for trips will be shown here later.
      </div>
    </aside>
  );
}
