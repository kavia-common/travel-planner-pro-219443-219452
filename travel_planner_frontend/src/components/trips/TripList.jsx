import React from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function TripList({ trips = [], onView, onEdit, onDelete }) {
  /** Render a list of trips with basic actions. */
  if (!trips || trips.length === 0) {
    return <div className="text-muted">No trips available.</div>;
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
      {trips.map((trip) => (
        <li
          key={trip.id}
          className="surface rounded-md transition-base"
          style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700 }}>{trip.name || trip.title || trip.id}</div>
              {trip.description && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{trip.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" onClick={() => onView?.(trip)}>View</Button>
              <Button variant="ghost" onClick={() => onEdit?.(trip)}>Edit</Button>
              <Button variant="ghost" onClick={() => onDelete?.(trip)}>Remove</Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
