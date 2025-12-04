import React, { useEffect, useId, useState } from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function TripForm({ initial = null, onSubmit, onCancel, submitting = false }) {
  /** Trip form for creating or updating a trip. */
  const [name, setName] = useState(initial?.name || initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.endDate || '');
  const formId = useId();

  useEffect(() => {
    setName(initial?.name || initial?.title || '');
    setDescription(initial?.description || '');
    setStartDate(initial?.startDate || '');
    setEndDate(initial?.endDate || '');
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { name, description, startDate, endDate };
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby={`${formId}-title`} aria-describedby={`${formId}-desc`}>
      <h3 id={`${formId}-title`} style={{ marginTop: 0 }}> {initial ? 'Edit Trip' : 'Create Trip'} </h3>
      <p id={`${formId}-desc`} className="text-muted" style={{ marginTop: 4, marginBottom: 16 }}>
        {initial ? 'Update your trip details below.' : 'Provide details for your new trip.'}
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Name</span>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', resize: 'vertical' }}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="transition-base"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="transition-base"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : (initial ? 'Save changes' : 'Create trip')}</Button>
      </div>
    </form>
  );
}
