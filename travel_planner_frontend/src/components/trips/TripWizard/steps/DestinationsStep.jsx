import React from 'react';

// PUBLIC_INTERFACE
export default function DestinationsStep({ value = [], onChange }) {
  /** Destinations step to manage one or more destinations. */
  const list = value.length ? value : [{ city: '', country: '', notes: '' }];

  const onUpdate = (idx, patch) => {
    const next = list.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange(next);
  };
  const onAdd = () => {
    onChange([...list, { city: '', country: '', notes: '' }]);
  };
  const onRemove = (idx) => {
    const next = list.filter((_, i) => i !== idx);
    onChange(next.length ? next : [{ city: '', country: '', notes: '' }]);
  };

  return (
    <div>
      <div className="helper">Add the cities and countries you plan to visit. At least one destination is recommended.</div>
      <div className="form-row">
        {list.map((d, idx) => {
          const valid = (d.city?.trim() || d.country?.trim());
          return (
            <div key={idx} className="list-item">
              <div className="form-row two">
                <div className="field">
                  <label htmlFor={`city-${idx}`}>City</label>
                  <input
                    id={`city-${idx}`}
                    type="text"
                    placeholder="e.g., Paris"
                    value={d.city}
                    onChange={(e) => onUpdate(idx, { city: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        onAdd();
                      }
                    }}
                  />
                </div>
                <div className="field">
                  <label htmlFor={`country-${idx}`}>Country</label>
                  <input
                    id={`country-${idx}`}
                    type="text"
                    placeholder="e.g., France"
                    value={d.country}
                    onChange={(e) => onUpdate(idx, { country: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        onAdd();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor={`notes-${idx}`}>Notes (optional)</label>
                <textarea
                  id={`notes-${idx}`}
                  rows={2}
                  placeholder="Any particular sights or preferences"
                  value={d.notes}
                  onChange={(e) => onUpdate(idx, { notes: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      onAdd();
                    }
                  }}
                />
                {!valid && <div className="error">Please enter at least a city or a country.</div>}
              </div>
              <div className="list-actions">
                <button type="button" onClick={onAdd} aria-label="Add destination">+ Add</button>
                {list.length > 1 && (
                  <button type="button" onClick={() => onRemove(idx)} aria-label="Remove destination">Remove</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
