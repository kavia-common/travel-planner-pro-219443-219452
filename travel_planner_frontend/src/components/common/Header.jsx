import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * PUBLIC_INTERFACE
 * App Header with Ocean Professional gradient and active nav.
 */
const Header = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="app-header">
      <div className="inner">
        <div style={{fontWeight:800, fontSize:'18px', color:'var(--color-primary)'}}>Travel Planner Pro</div>
        <nav className="nav" aria-label="Primary">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
          <Link to="/trips" className={isActive('/trips') ? 'active' : ''}>Trips</Link>
          <Link to="/explore" className={isActive('/explore') ? 'active' : ''}>Explore</Link>
          <Link to="/settings" className={isActive('/settings') ? 'active' : ''}>Settings</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
