import React, { useEffect } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * Dashboard landing page showing quick actions and a brief intro with hero banner.
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
      {/* Hero banner with decorative gradient and banner image */}
      <section
        className="rounded-lg transition-base"
        style={{
          background: 'linear-gradient(120deg, var(--gradient-start), transparent 60%), var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-6)',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 'var(--space-6)',
          alignItems: 'center',
        }}
        aria-label="Welcome hero"
      >
        <div>
          <h1>Plan journeys with ease</h1>
          <p className="text-muted" style={{ marginTop: 8, marginBottom: 16 }}>
            Create trips, organize itineraries, and visualize your travel timeline — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary">Create Trip</Button>
            <Button variant="ghost">Browse Templates</Button>
          </div>
        </div>
        <div style={{ justifySelf: 'end', width: '100%' }}>
          <img
            src="/assets/hero-banner.jpg"
            alt="Travel illustrations with landmarks"
            style={{ width: '100%', height: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--color-border)' }}
          />
        </div>
      </section>

      <Card title="Upcoming Highlights" subtitle="A snapshot of your plans">
        {loading && <div className="text-muted" aria-live="polite">Loading your trips…</div>}
        {!!error && (
          <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
            Unable to load trips. Please try again.
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-muted" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/empty-travel.png" alt="" aria-hidden style={{ width: 28, height: 28, opacity: 0.9 }} />
            No upcoming items. Start by adding a trip.
          </div>
        )}
        {!loading && !error && trips.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {trips.slice(0, 3).map((t) => (
              <li key={t.id} className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{t.name || t.title || t.id}</div>
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
