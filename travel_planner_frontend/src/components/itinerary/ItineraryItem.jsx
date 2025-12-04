import React, { memo } from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
function ItineraryItem({ item, onEdit, onRemove }) {
  /** Single itinerary item row. */
  if (!item) return null;
  return (
    <div className="surface rounded-md" style={{ padding: '0.75rem', border: '1px solid var(--color-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600 }}>{item.title || item.name || item.type || 'Itinerary Item'}</div>
          {item.time && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{item.time}</div>}
          {item.notes && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{item.notes}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" onClick={() => onEdit?.(item)}>Edit</Button>
          <Button variant="ghost" onClick={() => onRemove?.(item)}>Remove</Button>
        </div>
      </div>
    </div>
  );
}

export default memo(ItineraryItem);
