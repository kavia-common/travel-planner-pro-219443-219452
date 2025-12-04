import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Trips from '../pages/Trips';
import TripDetails from '../pages/TripDetails';
import Calendar from '../pages/Calendar';
import Settings from '../pages/Settings';
import Explore from '../pages/Explore';
import { isEnabled } from '../flags/featureFlags';

const FEATURE_EXPLORE = 'FEATURE_EXPLORE';

/**
 * PUBLIC_INTERFACE
 * Router centralizes all application routes. Useful for code-splitting or nested layouts later.
 */
export default function Router() {
  const showExplore = isEnabled(FEATURE_EXPLORE);
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {showExplore && <Route path="/explore" element={<Explore />} />}
      <Route path="/trips" element={<Trips />} />
      <Route path="/trips/:tripId" element={<TripDetails />} />
      <Route path="/calendar" element={<Calendar />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
