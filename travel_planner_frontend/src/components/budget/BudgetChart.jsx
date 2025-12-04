import React, { useMemo } from 'react';

/**
 * Lightweight bar chart using SVG to show category breakdown.
 */

// PUBLIC_INTERFACE
export default function BudgetChart({ breakdown = [], currency = 'USD' }) {
  /** Renders a simple horizontal bar chart from breakdown entries [{category, amount}] */
  const max = useMemo(() => Math.max(0, ...breakdown.map((b) => Number(b.amount || 0))), [breakdown]);

  if (!breakdown.length) return null;

  return (
    <section aria-labelledby="budget-chart-title" style={styles.card}>
      <h3 id="budget-chart-title" style={styles.title}>Spending by Category</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {breakdown.map((b) => {
          const pct = max > 0 ? (b.amount / max) * 100 : 0;
          return (
            <div key={b.category} style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span>{b.category}</span>
                <span>{currency} {Number(b.amount || 0).toFixed(2)}</span>
              </div>
              <div style={styles.barWrap} aria-hidden="true">
                <div style={{ ...styles.bar, width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const styles = {
  card: {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid rgba(17,24,39,0.08)',
    borderRadius: 12,
    padding: 16,
    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
  },
  title: { margin: '0 0 12px', fontSize: 16 },
  barWrap: {
    width: '100%',
    height: 10,
    background: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    background: 'var(--secondary, #F59E0B)',
    transition: 'width 250ms ease',
  },
};
