import React, { useMemo } from 'react';

function addDays(dateStr, days) {
  if (!dateStr) return '';
  const base = new Date(dateStr);
  if (Number.isNaN(base.getTime())) return '';
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  const iso = d.toISOString();
  return iso.slice(0, 10);
}

// PUBLIC_INTERFACE
export default function DatesStep({ value, onChange }) {
  /** Dates step for choosing start and end dates with validation. */
  const { start = '', end = '' } = value || {};
  const valid = useMemo(() => {
    if (!start || !end) return false;
    const s = new Date(start);
    const e = new Date(end);
    return !Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e.getTime() >= s.getTime();
  }, [start, end]);

  const setQuick = (days) => {
    if (!start) return;
    const newEnd = addDays(start, days);
    onChange({ start, end: newEnd });
  };

  return (
    <div>
      <div className="form-row two">
        <div className="field">
          <label htmlFor="date-start">Start Date</label>
          <input
            id="date-start"
            type="date"
            value={start}
            onChange={(e) => onChange({ start: e.target.value, end })}
            aria-required="true"
          />
          <div className="quick-durations" aria-label="Quick durations">
            <button type="button" onClick={() => setQuick(2)} title="Weekend">Weekend</button>
            <button type="button" onClick={() => setQuick(7)} title="1 week">+1w</button>
            <button type="button" onClick={() => setQuick(14)} title="2 weeks">+2w</button>
          </div>
        </div>
        <div className="field">
          <label htmlFor="date-end">End Date</label>
          <input
            id="date-end"
            type="date"
            value={end}
            onChange={(e) => onChange({ start, end: e.target.value })}
            aria-required="true"
            aria-invalid={!valid}
          />
          {!valid && <div className="error">End date must be the same or after start date.</div>}
        </div>
      </div>
    </div>
  );
}
