import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * Trips page: shows user's trips and management options.
 */
export default function Trips() {
  const { trips, loading, error, loadTrips } = useTrips();

  useEffect(() => {
    loadTrips().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card title="My Trips" subtitle="All your journeys in one place" footer={
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="primary">Create Trip</Button>
        <Button variant="ghost">Import</Button>
      </div>
    }>
      {loading && <div className="text-muted">Loading trips…</div>}
      {error && (
        <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
          Failed to load trips.
        </div>
      )}
      {!loading && !error && trips.length === 0 && (
        <div className="text-muted">No trips yet. Use the Create Trip action to add your first itinerary.</div>
      )}
      {!loading && !error && trips.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {trips.map((t) => (
            <li key={t.id} className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name || t.title || t.id}</div>
                  {t.description && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{t.description}</div>}
                </div>
                <Link to={`/trips/${t.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="ghost" ariaLabel={`View ${t.name || t.id}`}>View</Button>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
