import React, { useCallback } from 'react';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * A single packing item row rendering packed state, name, quantity steppers, optional notes,
 * category reassignment, and delete control.
 */
export default function PackingItem({
  item,
  categories,
  onTogglePacked,
  onChangeQuantity,
  onChangeNotes,
  onChangeCategory,
  onDelete,
}) {
  const inc = useCallback(() => onChangeQuantity(item.id, Math.max(1, (item.quantity || 1) + 1)), [item, onChangeQuantity]);
  const dec = useCallback(() => onChangeQuantity(item.id, Math.max(1, (item.quantity || 1) - 1)), [item, onChangeQuantity]);

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      onTogglePacked(item.id, !item.packed);
    }
  };

  return (
    <div
      className="transition-base"
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto auto auto',
        gap: 8,
        alignItems: 'center',
        padding: '8px 10px',
        border: '1px solid rgba(17,24,39,0.08)',
        borderRadius: 10,
        background: 'var(--color-surface)',
        boxShadow: 'var(--shadow-sm)',
      }}
      role="listitem"
    >
      <input
        type="checkbox"
        aria-label={`Mark ${item.name} as packed`}
        checked={!!item.packed}
        onChange={(e) => onTogglePacked(item.id, e.target.checked)}
        onKeyDown={handleKey}
      />
      <div>
        <div style={{ fontWeight: 600, textDecoration: item.packed ? 'line-through' : 'none' }}>{item.name}</div>
        <div className="text-muted" style={{ fontSize: 12 }}>
          {item.notes ? (
            <input
              aria-label={`Notes for ${item.name}`}
              value={item.notes}
              onChange={(e) => onChangeNotes(item.id, e.target.value)}
              placeholder="Add notes"
              style={{
                width: '100%',
                border: '1px solid rgba(17,24,39,0.12)',
                borderRadius: 6,
                padding: '4px 6px',
              }}
            />
          ) : (
            <button
              onClick={() => onChangeNotes(item.id, '')}
              title="Add notes"
              style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'text', padding: 0 }}
            >
              {/* Notes field renders as input when non-empty; clicking sets empty for user to type */}
              Add notes
            </button>
          )}
        </div>
      </div>
      <div aria-label="Quantity controls" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Button variant="ghost" ariaLabel={`Decrease ${item.name} quantity`} onClick={dec}>-</Button>
        <div aria-live="polite" style={{ minWidth: 28, textAlign: 'center' }}>{item.quantity || 1}</div>
        <Button variant="ghost" ariaLabel={`Increase ${item.name} quantity`} onClick={inc}>+</Button>
      </div>
      <div>
        <label style={{ fontSize: 12, color: '#6B7280', marginRight: 6 }} htmlFor={`cat-${item.id}`}>Category</label>
        <select
          id={`cat-${item.id}`}
          value={item.category || ''}
          onChange={(e) => onChangeCategory(item.id, e.target.value)}
          style={{
            border: '1px solid rgba(17,24,39,0.12)',
            borderRadius: 6,
            padding: '6px 8px',
            background: 'white',
          }}
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Button variant="ghost" ariaLabel={`Delete ${item.name}`} onClick={() => onDelete(item.id)}>Delete</Button>
      </div>
    </div>
  );
}
