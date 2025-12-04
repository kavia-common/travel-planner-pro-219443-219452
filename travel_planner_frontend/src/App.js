import React from 'react';
import './App.css';
import Header from './components/common/Header';
import Sidebar from './components/common/Sidebar';
import Card from './components/common/Card';
import Button from './components/common/Button';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';

// PUBLIC_INTERFACE
function App() {
  /** App shell providing Header, Sidebar, and Main content area with routing. */
  useTheme(); // initialize theme behavior (sets data-theme and persists)

  return (
    <div className="app-shell">
      <Header />
      <div className="main-area">
        <div className="layout-row">
          <Sidebar />
          <main aria-label="Main content" className="transition-base" style={{ minHeight: '60vh' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trips" element={<Trips />} />
              <Route path="/trips/:tripId" element={<TripDetails />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/settings" element={<Settings />} />
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
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
