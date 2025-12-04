import React from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function ItineraryView({ items = [], onEdit, onRemove }) {
  /** Render itinerary items with actions. */
  if (!items || items.length === 0) {
    return <div className="text-muted">No itinerary items yet.</div>;
  }
  return (
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
              <Button variant="ghost" onClick={() => onEdit?.(it)}>Edit</Button>
              <Button variant="ghost" onClick={() => onRemove?.(it)}>Remove</Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
