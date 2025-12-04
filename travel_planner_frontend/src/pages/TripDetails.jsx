import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useItinerary } from '../hooks/useItinerary';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * TripDetails page: displays details for a specific trip with itinerary listing.
 */
export default function TripDetails() {
  const { tripId } = useParams();
  const { items, loading, error, loadItinerary } = useItinerary(tripId);
  const { getTrip, selectTrip } = useTrips();

  useEffect(() => {
    selectTrip(tripId);
    // try to hydrate trip info into store (no-op if fails)
    getTrip(tripId).catch(() => {});
    loadItinerary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  return (
    <Card title="Trip Details" subtitle={`Trip ID: ${tripId}`}>
      {loading && <div className="text-muted">Loading itinerary…</div>}
      {error && (
        <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
          Failed to load itinerary.
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-muted">No itinerary items yet. Add your first activity.</div>
      )}
      {!loading && !error && items.length > 0 && (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
          {items.map((it) => (
            <li key={it.id} className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{it.title || it.name || it.type || 'Itinerary Item'}</div>
                  {it.time && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{it.time}</div>}
                  {it.notes && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{it.notes}</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="ghost">Edit</Button>
                  <Button variant="ghost">Remove</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
