import React from 'react';

/**
 * Renders a list of expenses with Edit/Delete actions.
 */

// PUBLIC_INTERFACE
export default function ExpenseList({ items, onEdit, onDelete }) {
  /** List of expenses
   * Props:
   *  - items: [{id, title, amount, category, date}]
   *  - onEdit: fn(item)
   *  - onDelete: fn(item)
   */
  if (!items || items.length === 0) {
    return <p style={{ color: 'var(--text-muted, #374151)' }}>No expenses yet.</p>;
  }

  return (
    <ul role="list" aria-label="Expenses" style={styles.list}>
      {items.map((e) => (
        <li key={e.id} style={styles.item}>
          <div style={{ flex: 1 }}>
            <div style={styles.rowTop}>
              <strong style={styles.title}>{e.title || 'Untitled'}</strong>
              <span style={styles.amount}>{(e.currency || 'USD')} {Number(e.amount || 0).toFixed(2)}</span>
            </div>
            <div style={styles.rowMeta}>
              <span style={styles.badge} aria-label={`Category ${e.category || 'Uncategorized'}`}>
                {e.category || 'Uncategorized'}
              </span>
              {e.date && <span style={styles.meta}>{new Date(e.date).toLocaleDateString()}</span>}
            </div>
          </div>
          <div style={styles.actions}>
            <button
              onClick={() => onEdit?.(e)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') onEdit?.(e); }}
              style={styles.btnSecondary}
              aria-label={`Edit expense ${e.title || ''}`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(e)}
              onKeyDown={(ev) => { if (ev.key === 'Enter' || ev.key === ' ') onDelete?.(e); }}
              style={styles.btnDanger}
              aria-label={`Delete expense ${e.title || ''}`}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}

const styles = {
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    background: 'var(--surface)',
    borderRadius: 10,
    border: '1px solid rgba(17,24,39,0.06)',
  },
  rowTop: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  title: { color: 'var(--text)' },
  amount: { color: 'var(--text)', fontWeight: 600 },
  rowMeta: { display: 'flex', gap: 8, marginTop: 4 },
  badge: { fontSize: 12, background: 'var(--background)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(17,24,39,0.06)' },
  meta: { fontSize: 12, color: 'var(--text-muted, #374151)' },
  actions: { display: 'flex', gap: 8 },
  btnSecondary: {
    background: 'transparent',
    color: 'var(--primary, #2563EB)',
    border: '1px solid var(--primary, #2563EB)',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
  },
  btnDanger: {
    background: 'transparent',
    color: '#EF4444',
    border: '1px solid #EF4444',
    borderRadius: 8,
    padding: '6px 10px',
    cursor: 'pointer',
  },
};
