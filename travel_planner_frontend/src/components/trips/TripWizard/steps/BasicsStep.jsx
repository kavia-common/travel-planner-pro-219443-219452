import React from 'react';

// PUBLIC_INTERFACE
export default function BasicsStep({ value, onChange }) {
  /** Basics step collects trip name (required) and description (optional). */
  const { name, description } = value || { name: '', description: '' };
  const valid = !!name?.trim();

  return (
    <div>
      <div className="form-row">
        <div className="field">
          <label htmlFor="trip-name">Trip Name</label>
          <input
            id="trip-name"
            type="text"
            placeholder="e.g., Summer in Europe"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            aria-required="true"
            aria-invalid={!valid}
          />
          {!valid && <div className="error">Trip name is required.</div>}
          <div className="helper">Give your trip a memorable name.</div>
        </div>
        <div className="field">
          <label htmlFor="trip-description">Description (optional)</label>
          <textarea
            id="trip-description"
            rows={4}
            placeholder="Add notes or goals for this trip"
            value={description}
            onChange={(e) => onChange({ description: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
