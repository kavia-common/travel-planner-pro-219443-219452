import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import NotificationsBell from '../notifications/NotificationsBell';

/**
 * PUBLIC_INTERFACE
 * App Header with Ocean Professional gradient, active nav, and notifications bell.
 */
const Header = ({ currentTripId = null }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{fontWeight:800, fontSize:'18px', color:'var(--color-primary)'}}>Travel Planner Pro</div>
        <nav className="nav" aria-label="Primary" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
          <Link to="/trips" className={isActive('/trips') ? 'active' : ''}>Trips</Link>
          <Link to="/explore" className={isActive('/explore') ? 'active' : ''}>Explore</Link>
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</Link>
          <NotificationsBell tripId={currentTripId} />
        </nav>
      </div>
    </header>
  );
};

export default Header;
