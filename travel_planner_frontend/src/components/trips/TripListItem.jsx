import React from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function TripListItem({ trip, onView, onEdit, onDelete }) {
  /** A single trip row with actions. */
  if (!trip) return null;
  return (
    <div className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{trip.name || trip.title || trip.id}</div>
          {trip.description && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{trip.description}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => onView?.(trip)}>View</Button>
          <Button variant="ghost" onClick={() => onEdit?.(trip)}>Edit</Button>
          <Button variant="ghost" onClick={() => onDelete?.(trip)}>Remove</Button>
        </div>
      </div>
    </div>
  );
}
