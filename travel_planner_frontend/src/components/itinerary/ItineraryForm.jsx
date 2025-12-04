import React, { useEffect, useId, useState } from 'react';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function ItineraryForm({ initial = null, onSubmit, onCancel, submitting = false }) {
  /** Form for adding or editing an itinerary item. */
  const [title, setTitle] = useState(initial?.title || initial?.name || '');
  const [time, setTime] = useState(initial?.time || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [type, setType] = useState(initial?.type || 'activity');
  const formId = useId();

  useEffect(() => {
    setTitle(initial?.title || initial?.name || '');
    setTime(initial?.time || '');
    setNotes(initial?.notes || '');
    setLocation(initial?.location || '');
    setType(initial?.type || 'activity');
  }, [initial]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { title, time, notes, location, type };
    onSubmit?.(payload);
  }

  return (
    <form onSubmit={handleSubmit} aria-labelledby={`${formId}-title`} aria-describedby={`${formId}-desc`}>
      <h3 id={`${formId}-title`} style={{ marginTop: 0 }}>{initial ? 'Edit Itinerary Item' : 'Add Itinerary Item'}</h3>
      <p id={`${formId}-desc`} className="text-muted" style={{ marginTop: 4, marginBottom: 16 }}>
        {initial ? 'Update the activity details.' : 'Fill in details of the activity.'}
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span>Title</span>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Time</span>
            <input
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="transition-base"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="transition-base"
              style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            >
              <option value="activity">Activity</option>
              <option value="transport">Transport</option>
              <option value="meal">Meal</option>
              <option value="lodging">Lodging</option>
              <option value="note">Note</option>
            </select>
          </label>
        </div>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span>Notes</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="transition-base"
            style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', resize: 'vertical' }}
          />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
        <Button variant="ghost" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={submitting}>{submitting ? 'Saving…' : (initial ? 'Save changes' : 'Add item')}</Button>
      </div>
    </form>
  );
}
