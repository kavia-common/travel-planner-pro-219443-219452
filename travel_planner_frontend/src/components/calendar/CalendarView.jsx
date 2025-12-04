import React from 'react';

// PUBLIC_INTERFACE
export default function CalendarView({ items = [] }) {
  /** Minimal calendar-like list grouped by date for visualization placeholder. */
  const byDate = items.reduce((acc, it) => {
    const d = (it.time || '').slice(0, 10) || 'unscheduled';
    acc[d] = acc[d] || [];
    acc[d].push(it);
    return acc;
  }, {});
  const dates = Object.keys(byDate).sort();

  if (dates.length === 0) {
    return <div className="text-muted">Nothing scheduled.</div>;
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {dates.map((d) => (
        <div key={d} className="surface rounded-md" style={{ border: '1px solid var(--color-border)' }}>
          <div className="p-4" style={{ borderBottom: '1px solid var(--color-border)', fontWeight: 600 }}>
            {d === 'unscheduled' ? 'Unscheduled' : new Date(d).toDateString()}
          </div>
          <ul style={{ listStyle: 'none', padding: '0.75rem', margin: 0, display: 'grid', gap: 8 }}>
            {byDate[d].map((it) => (
              <li key={it.id} className="rounded-md" style={{ padding: '0.5rem', border: '1px dashed var(--color-border)' }}>
                <div style={{ fontWeight: 600 }}>{it.title || it.name || it.type || 'Item'}</div>
                {it.time && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{new Date(it.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                {it.location && <div className="text-muted" style={{ fontSize: 13, marginTop: 4 }}>{it.location}</div>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
