import React from 'react';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * Trips page: shows user's trips and management options.
 */
export default function Trips() {
  return (
    <Card title="My Trips" subtitle="All your journeys in one place">
      <div className="text-muted">No trips yet. Use the Create Trip action to add your first itinerary.</div>
    </Card>
  );
}
