import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Trips from '../pages/Trips';
import TripDetails from '../pages/TripDetails';
import Calendar from '../pages/Calendar';
import Settings from '../pages/Settings';
import Explore from '../pages/Explore';
import TripWizard from '../components/trips/TripWizard/TripWizard';
import { isEnabled } from '../flags/featureFlags';

const FEATURE_EXPLORE = 'FEATURE_EXPLORE';

// PUBLIC_INTERFACE
export default function Router() {
  /** Router centralizes all application routes and applies feature gating. */
  const showExplore = isEnabled(FEATURE_EXPLORE);
  const wizardEnabled = isEnabled('TRIP_WIZARD');

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {showExplore && <Route path="/explore" element={<Explore />} />}
      <Route path="/trips" element={<Trips />} />
      {wizardEnabled && <Route path="/trips/new" element={<TripWizard />} />}
      {wizardEnabled && <Route path="/trips/:id/edit" element={<TripWizard />} />}
      <Route path="/trips/:tripId" element={<TripDetails />} />
      {isEnabled('PLACES_SEARCH') && <Route path="/trips/:tripId/places" element={<TripDetails />} />}
      <Route path="/calendar" element={<Calendar />} />
      {/* Optional direct calendar view for a specific trip, reuse TripDetails Calendar tab */}
      {isEnabled('ITINERARY_CALENDAR') && <Route path="/trips/:tripId/calendar" element={<TripDetails />} />}
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
}
