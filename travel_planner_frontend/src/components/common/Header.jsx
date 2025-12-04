import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationsBell from '../notifications/NotificationsBell';
import featureFlags, { isEnabled } from '../../flags/featureFlags';
import GlobalSearch from '../search/GlobalSearch';

/**
 * PUBLIC_INTERFACE
 * App Header with Ocean Professional gradient, active nav, notifications bell, and global search.
 */
const Header = ({ currentTripId = null }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isEnabled('GLOBAL_SEARCH')) return;
    const handler = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === '/') {
        // focus the header search input (opens global search)
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
          setOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <header className="app-header">
      <div className="inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div
          style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-primary)', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Travel Planner Pro
        </div>

        {isEnabled('GLOBAL_SEARCH') ? (
          <div className="flex-1" style={{ maxWidth: 520 }}>
            <input
              ref={inputRef}
              placeholder="Search (Press / or Cmd/Ctrl+K)"
              className="input"
              onFocus={() => setOpen(true)}
              readOnly
              aria-label="Global search"
            />
          </div>
        ) : <div className="flex-1" />}

        <nav className="nav" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
          <Link to="/trips" className={isActive('/trips') ? 'active' : ''}>Trips</Link>
          {isEnabled('FEATURE_EXPLORE') && (
            <Link to="/explore" className={isActive('/explore') ? 'active' : ''}>Explore</Link>
          )}
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</Link>
          <NotificationsBell tripId={currentTripId} />
        </nav>
      </div>
      {isEnabled('GLOBAL_SEARCH') ? <GlobalSearch isOpen={open} onClose={() => setOpen(false)} /> : null}
    </header>
  );
};

export default Header;
