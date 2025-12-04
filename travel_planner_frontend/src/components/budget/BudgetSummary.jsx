import React from 'react';
import '../..//styles/util.css';

/**
 * Displays budget totals and a progress bar with accessible labels.
 */

// PUBLIC_INTERFACE
export default function BudgetSummary({ totals, onEditBudget }) {
  /** Render overview of budget totals and progress.
   * Props:
   *  - totals: { total, target, remaining, progress, currency }
   *  - onEditBudget: function to trigger edit budget action
   */
  const { total = 0, target = 0, remaining = 0, progress = 0, currency = 'USD' } = totals || {};
  const pct = Math.min(Math.max(progress, 0), 100);

  return (
    <section aria-labelledby="budget-summary-title" className="budget-summary card" style={styles.card}>
      <h2 id="budget-summary-title" style={styles.title}>Budget Summary</h2>

      <div style={styles.grid}>
        <div style={styles.metric}>
          <span style={styles.label}>Target</span>
          <strong style={styles.value}>{currency} {target.toFixed(2)}</strong>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>Spent</span>
          <strong style={styles.value}>{currency} {total.toFixed(2)}</strong>
        </div>
        <div style={styles.metric}>
          <span style={styles.label}>Remaining</span>
          <strong style={styles.value}>{currency} {remaining.toFixed(2)}</strong>
        </div>
      </div>

      <div role="progressbar"
           aria-valuemin={0}
           aria-valuemax={100}
           aria-valuenow={Math.round(pct)}
           aria-label="Budget usage"
           style={styles.progressWrap}>
        <div style={{ ...styles.progressBar, width: `${pct}%` }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={onEditBudget} style={styles.editBtn} aria-label="Edit budget target">
          Edit Budget
        </button>
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
  title: { margin: '0 0 12px', fontSize: 18 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 },
  metric: { background: 'var(--background)', padding: 12, borderRadius: 10, border: '1px solid rgba(17,24,39,0.06)' },
  label: { display: 'block', fontSize: 12, color: 'var(--text-muted, #374151)' },
  value: { fontSize: 16 },
  progressWrap: {
    width: '100%',
    height: 10,
    background: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
    margin: '6px 0 12px',
  },
  progressBar: {
    height: '100%',
    background: 'var(--primary, #2563EB)',
    transition: 'width 250ms ease',
  },
  editBtn: {
    background: 'var(--primary, #2563EB)',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
  },
};
