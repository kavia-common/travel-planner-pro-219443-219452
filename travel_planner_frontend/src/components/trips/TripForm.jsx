import React, { useEffect, useId, useMemo, useState } from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function TripForm({ initial = null, onSubmit, onCancel, submitting = false }) {
  /** Trip form for creating or updating a trip with basic validation and ARIA. */
  const [name, setName] = useState(initial?.name || initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [startDate, setStartDate] = useState(initial?.startDate || '');
  const [endDate, setEndDate] = useState(initial?.endDate || '');
  const [errors, setErrors] = useState({});
  const formId = useId();

  useEffect(() => {
    setName(initial?.name || initial?.title || '');
    setDescription(initial?.description || '');
    setStartDate(initial?.startDate || '');
    setEndDate(initial?.endDate || '');
    setErrors({});
  }, [initial]);

  const clientErrors = useMemo(() => {
    const errs = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (startDate && endDate && startDate > endDate) errs.endDate = 'End date must be after start date';
    return errs;
  }, [name, startDate, endDate]);

  function handleSubmit(e) {
    e.preventDefault();
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;
    const payload = { name: name.trim(), description, startDate, endDate };
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
            aria-invalid={!!clientErrors.name}
            aria-describedby={clientErrors.name ? `${formId}-name-error` : undefined}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
          {clientErrors.name && (
            <span id={`${formId}-name-error`} role="alert" style={{ color: 'var(--color-error)', fontSize: 12 }}>
              {clientErrors.name}
            </span>
          )}
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
              aria-invalid={!!clientErrors.endDate}
              aria-describedby={clientErrors.endDate ? `${formId}-end-error` : undefined}
              className="transition-base"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            {clientErrors.endDate && (
              <span id={`${formId}-end-error`} role="alert" style={{ color: 'var(--color-error)', fontSize: 12 }}>
                {clientErrors.endDate}
              </span>
            )}
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={submitting || Object.keys(clientErrors).length > 0}>
          {submitting ? 'Saving…' : (initial ? 'Save changes' : 'Create trip')}
        </Button>
      </div>
    </form>
  );
}
