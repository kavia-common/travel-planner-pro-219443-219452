import React from 'react';

// PUBLIC_INTERFACE
export default function ReviewStep({ value, onEditStep }) {
  /** Review step shows a summary and allows editing by jumping back to steps. */
  const { name, description, dates, destinations = [], travelers = [] } = value || {};

  return (
    <div>
      <div className="helper">Review your trip details. Use the Edit buttons to jump back to a section.</div>
      <section className="list-item" style={{ marginBottom: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Basics</h3>
          <button type="button" onClick={() => onEditStep(0)}>Edit</button>
        </header>
        <div><strong>Name:</strong> {name || '-'}</div>
        <div><strong>Description:</strong> {description || '-'}</div>
      </section>

      <section className="list-item" style={{ marginBottom: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Dates</h3>
          <button type="button" onClick={() => onEditStep(1)}>Edit</button>
        </header>
        <div><strong>Start:</strong> {dates?.start || '-'}</div>
        <div><strong>End:</strong> {dates?.end || '-'}</div>
      </section>

      <section className="list-item" style={{ marginBottom: 12 }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Destinations</h3>
          <button type="button" onClick={() => onEditStep(2)}>Edit</button>
        </header>
        {(destinations.length ? destinations : [{ city: '', country: '', notes: '' }]).map((d, idx) => (
          <div key={idx} style={{ padding: '4px 0' }}>
            <div><strong>City:</strong> {d.city || '-'}</div>
            <div><strong>Country:</strong> {d.country || '-'}</div>
            <div><strong>Notes:</strong> {d.notes || '-'}</div>
          </div>
        ))}
      </section>

      <section className="list-item">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Travelers</h3>
          <button type="button" onClick={() => onEditStep(3)}>Edit</button>
        </header>
        {(travelers.length ? travelers : [{ name: '', email: '' }]).map((t, idx) => (
          <div key={idx} style={{ padding: '4px 0' }}>
            <div><strong>Name:</strong> {t.name || '-'}</div>
            <div><strong>Email:</strong> {t.email || '-'}</div>
          </div>
        ))}
      </section>
    </div>
  );
}
