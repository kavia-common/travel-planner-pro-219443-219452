import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import HealthService from '../../services/healthService';
import { isEnabled } from '../../flags/featureFlags';

const FEATURE_EXPLORE = 'FEATURE_EXPLORE';

// PUBLIC_INTERFACE
export default function Header() {
  /** Header with app title, nav links, theme toggle, and backend health status indicator */
  const { theme, toggleTheme } = useTheme();
  const showExplore = isEnabled(FEATURE_EXPLORE);

  const linkStyle = ({ isActive }) => ({
    position: 'relative',
    textDecoration: 'none',
    padding: '8px 12px',
    borderRadius: '10px',
    color: isActive ? '#fff' : 'var(--color-text)',
    background: isActive ? 'linear-gradient(180deg, var(--color-primary-500), var(--color-primary-600))' : 'transparent',
    border: isActive ? '1px solid var(--color-primary-600)' : '1px solid var(--color-border)',
    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
  });

  // Health status state with polite ARIA updates
  const [status, setStatus] = useState({ ok: null, text: 'Checking…' });
  const liveRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    async function check() {
      const res = await HealthService.pingHealth();
      if (!mounted) return;
      const text = res.ok ? 'Online' : 'Offline';
      setStatus({ ok: res.ok, text });
      if (liveRef.current) {
        liveRef.current.textContent = `Backend status: ${text}`;
      }
    }
    check();
    const t = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(t); };
  }, []);

  const dotStyle = useMemo(() => {
    let bg = '#CBD5E1';
    if (status.ok === true) bg = '#10B981';
    if (status.ok === false) bg = '#EF4444';
    return {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: bg,
      border: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-sm)',
      display: 'inline-block',
    };
  }, [status.ok]);

  return (
    <header
      className="transition-base"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        backdropFilter: 'saturate(180%) blur(10px)',
        background: 'linear-gradient(180deg, var(--gradient-start), transparent)',
      }}
      aria-label="Top navigation bar"
    >
      <div className="flex items-center justify-between px-4 p-4" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="flex items-center gap-4">
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-text)' }}>
            <strong style={{ fontSize: 'var(--text-xl)' }}>Travel Planner Pro</strong>
          </Link>

          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="transition-base"
            title={`Backend status: ${status.text}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 8px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
            }}
          >
            <span aria-hidden style={dotStyle} />
            <span className="text-muted" style={{ fontSize: 12 }} ref={liveRef}>
              Backend status: {status.text}
            </span>
          </div>
        </div>

        <nav role="navigation" aria-label="Primary">
          <ul className="flex items-center gap-4" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            <li>
              <NavLink to="/" end style={linkStyle} aria-current={({ isActive }) => (isActive ? 'page' : undefined)}>
                Dashboard
              </NavLink>
            </li>
            {showExplore && (
              <li>
                <NavLink to="/explore" style={linkStyle} aria-current={({ isActive }) => (isActive ? 'page' : undefined)}>
                  Explore
                </NavLink>
              </li>
            )}
            <li>
              <NavLink to="/trips" style={linkStyle} aria-current={({ isActive }) => (isActive ? 'page' : undefined)}>
                Trips
              </NavLink>
            </li>
            <li>
              <NavLink to="/calendar" style={linkStyle} aria-current={({ isActive }) => (isActive ? 'page' : undefined)}>
                Calendar
              </NavLink>
            </li>
            <li>
              <NavLink to="/settings" style={linkStyle} aria-current={({ isActive }) => (isActive ? 'page' : undefined)}>
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          <HeaderNotificationBell />
        </div>
      </div>
    </header>
  );
}

function ThemeToggleButton({ theme, toggleTheme }) {
  return (
    <button
      onClick={toggleTheme}
      className="btn-base transition-base"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        padding: '8px 12px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.filter = 'saturate(1.05)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
      onFocus={(e) => { e.currentTarget.style.boxShadow = 'var(--focus-ring)'; }}
      onBlur={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

// Inline wrapper to lazy import NotificationBell without breaking initial render
function HeaderNotificationBell() {
  const [Comp, setComp] = React.useState(null);
  React.useEffect(() => {
    let mounted = true;
    import('../notifications/NotificationBell.jsx')
      .then((m) => {
        if (mounted) setComp(() => m.default);
      })
      .catch(() => setComp(() => () => null));
    return () => { mounted = false; };
  }, []);
  return Comp ? <Comp /> : null;
}
