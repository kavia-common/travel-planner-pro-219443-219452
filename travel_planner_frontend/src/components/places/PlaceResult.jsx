import React, { useMemo, useState } from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function PlaceResult({ place, onAdd }) {
  /** Render a single place result with action menu to add to itinerary or destinations. */
  const [openMenu, setOpenMenu] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState('');

  const secondary = useMemo(() => {
    const parts = [place.city, place.country].filter(Boolean);
    return parts.join(', ');
  }, [place.city, place.country]);

  const badgeStyle = {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 999,
    background: 'rgba(37,99,235,0.1)',
    color: '#2563EB',
    fontSize: 12,
    fontWeight: 600,
  };

  return (
    <div
      className="rounded-md"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        padding: 12,
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: '#2563EB',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.15)',
            }}
          />
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{place.name}</div>
          {place.type ? <span style={badgeStyle}>{place.type}</span> : null}
        </div>
        <div style={{ fontSize: 13, color: '#374151', marginTop: 2 }}>{secondary}</div>
        {place.address ? (
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{place.address}</div>
        ) : null}
      </div>

      <div style={{ position: 'relative' }}>
        <Button variant="primary" onClick={() => setOpenMenu((v) => !v)} ariaLabel="Add place">
          Add
        </Button>
        {openMenu && (
          <div
            role="menu"
            className="rounded-md"
            style={{
              position: 'absolute',
              right: 0,
              marginTop: 6,
              minWidth: 220,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 10,
            }}
          >
            <button
              className="btn-base"
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setShowDate(true);
                setOpenMenu(false);
                setDate(new Date().toISOString().slice(0, 10));
              }}
            >
              Add to itinerary (pick date)
            </button>
            <button
              className="btn-base"
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setOpenMenu(false);
                onAdd?.({ mode: 'itinerary-today', place });
              }}
            >
              Add to itinerary today
            </button>
            <div style={{ height: 1, background: 'var(--color-border)' }} />
            <button
              className="btn-base"
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: 10, background: 'transparent', border: 'none', cursor: 'pointer' }}
              onClick={() => {
                setOpenMenu(false);
                onAdd?.({ mode: 'destinations', place });
              }}
            >
              Add to destinations
            </button>
          </div>
        )}
      </div>

      {showDate && (
        <div
          className="rounded-md"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(2, 6, 23, 0.35)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 60,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDate(false);
          }}
        >
          <div
            className="surface-elevated rounded-md"
            style={{
              width: 360,
              padding: 16,
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              background: 'var(--color-surface)',
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Pick a date</div>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                marginBottom: 12,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button variant="secondary" onClick={() => setShowDate(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowDate(false);
                  onAdd?.({ mode: 'itinerary-date', place, date });
                }}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
