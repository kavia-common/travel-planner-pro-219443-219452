import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * PUBLIC_INTERFACE
 * Dashboard landing page showing quick actions and a brief intro.
 */
export default function Dashboard() {
  return (
    <div className="grid gap-4">
      <Card title="Welcome back" subtitle="Your travel planning hub">
        <p className="text-muted" style={{ marginBottom: 12 }}>
          Get started by creating a new trip or reviewing your upcoming itineraries.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="primary">Create Trip</Button>
          <Button variant="ghost">Import</Button>
        </div>
      </Card>
      <Card title="Upcoming Highlights" subtitle="A snapshot of your plans">
        <div className="text-muted">No upcoming items. Start by adding a trip.</div>
      </Card>
    </div>
  );
}
