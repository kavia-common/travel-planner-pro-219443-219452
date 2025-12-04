import React, { useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * Dashboard landing page showing quick actions and a brief intro.
 */
export default function Dashboard() {
  const { trips, loading, error, loadTrips } = useTrips();

  useEffect(() => {
    // Load a small set for dashboard preview (first page)
    loadTrips({ page: 1, pageSize: 5 }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        {loading && <div className="text-muted">Loading your trips…</div>}
        {error && (
          <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
            Unable to load trips.
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-muted">No upcoming items. Start by adding a trip.</div>
        )}
        {!loading && !error && trips.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {trips.slice(0, 3).map((t) => (
              <li key={t.id} className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.name || t.title || t.id}</div>
                    {t.description && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{t.description}</div>}
                  </div>
                  <Link to={`/trips/${t.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="ghost" ariaLabel={`Open ${t.name || t.id}`}>Open</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
