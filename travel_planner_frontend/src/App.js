import React, { Suspense, lazy } from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Card from './components/common/Card';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import { env } from './config/env';
import { useTrips } from './hooks/useTrips';

// Lazy load main pages for faster initial paint (no restructuring required)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Trips = lazy(() => import('./pages/Trips'));
const TripDetails = lazy(() => import('./pages/TripDetails'));
const Calendar = lazy(() => import('./pages/Calendar'));
const Settings = lazy(() => import('./pages/Settings'));
const SearchResults = lazy(() => import('./pages/SearchResults'));

function EnvBadge() {
  if (env.isProd) return null;
  return (
    <div
      aria-live="polite"
      className="transition-base"
      style={{
        position: 'fixed',
        bottom: 8,
        right: 8,
        zIndex: 250,
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        boxShadow: 'var(--shadow-sm)',
        opacity: 0.9,
      }}
    >
      {env.nodeEnv} • log: {env.logLevel}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** App shell providing Header, Sidebar, and Main content area with routing. */
  useTheme(); // initialize theme behavior (sets data-theme and persists)
  const { selectedTrip } = useTrips();

  return (
    <div className="app-shell">
      <Header currentTripId={selectedTrip || null} />
      <div className="main-area bg-hero">
        <div className="layout-row">
          <Sidebar />
          <main id="main-content" role="main" aria-label="Main content" className="transition-base" style={{ minHeight: '60vh' }}>
            <Suspense
              fallback={
                <Card title="Loading" subtitle="Preparing your experience">
                  <div className="text-muted">Loading page…</div>
                </Card>
              }
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trips" element={<Trips />} />
                <Route path="/trips/:tripId" element={<TripDetails />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<SearchResults />} />
                {/* Fallback: simple home placeholder (should rarely hit) */}
                <Route
                  path="*"
                  element={
                    <Card title="Not found" subtitle="The page you requested does not exist">
                      <div className="text-muted">Use the navigation above to find your way.</div>
                    </Card>
                  }
                />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
      <EnvBadge />
    </div>
  );
}

export default App;
