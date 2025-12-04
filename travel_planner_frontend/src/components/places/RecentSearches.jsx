import React from 'react';

// PUBLIC_INTERFACE
export default function RecentSearches({ items = [], onSelect }) {
  /** Render recent queries as quick chips */
  if (!items?.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
      {items.map((q, idx) => (
        <button
          key={`${q}-${idx}`}
          className="btn-base"
          aria-label={`Use recent search ${q}`}
          onClick={() => onSelect?.(q)}
          style={{
            borderRadius: 999,
            padding: '6px 10px',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            boxShadow: 'var(--shadow-sm)',
            fontSize: 13,
          }}
        >
          {q}
        </button>
      ))}
    </div>
  );
}
