import React from 'react';

// PUBLIC_INTERFACE
export default function TravelersStep({ value = [], onChange }) {
  /** Travelers step to manage traveler list; name is required. */
  const list = value.length ? value : [{ name: '', email: '' }];

  const onUpdate = (idx, patch) => {
    const next = list.map((t, i) => (i === idx ? { ...t, ...patch } : t));
    onChange(next);
  };
  const onAdd = () => {
    onChange([...list, { name: '', email: '' }]);
  };
  const onRemove = (idx) => {
    const next = list.filter((_, i) => i !== idx);
    onChange(next.length ? next : [{ name: '', email: '' }]);
  };

  return (
    <div>
      <div className="helper">Add the people traveling with you. Name is required; email is optional.</div>
      <div className="form-row">
        {list.map((t, idx) => {
          const valid = t.name?.trim();
          return (
            <div key={idx} className="list-item">
              <div className="form-row two">
                <div className="field">
                  <label htmlFor={`trav-name-${idx}`}>Name</label>
                  <input
                    id={`trav-name-${idx}`}
                    type="text"
                    placeholder="e.g., Alex Johnson"
                    value={t.name}
                    onChange={(e) => onUpdate(idx, { name: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        onAdd();
                      }
                    }}
                    aria-required="true"
                    aria-invalid={!valid}
                  />
                  {!valid && <div className="error">Traveler name is required.</div>}
                </div>
                <div className="field">
                  <label htmlFor={`trav-email-${idx}`}>Email (optional)</label>
                  <input
                    id={`trav-email-${idx}`}
                    type="email"
                    placeholder="e.g., alex@example.com"
                    value={t.email}
                    onChange={(e) => onUpdate(idx, { email: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.shiftKey) {
                        e.preventDefault();
                        onAdd();
                      }
                    }}
                  />
                </div>
              </div>
              <div className="list-actions">
                <button type="button" onClick={onAdd} aria-label="Add traveler">+ Add</button>
                {list.length > 1 && (
                  <button type="button" onClick={() => onRemove(idx)} aria-label="Remove traveler">Remove</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
