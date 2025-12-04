import React from 'react';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * Settings page: manage preferences and account settings.
 */
export default function Settings() {
  return (
    <Card title="Settings" subtitle="Personalize your Travel Planner Pro experience">
      <div className="text-muted">Theme, notifications, and other preferences will appear here.</div>
    </Card>
  );
}
