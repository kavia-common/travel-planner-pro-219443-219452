import React, { useCallback } from 'react';
import './explore.css';

const REGIONS = ['Americas', 'Europe', 'Asia', 'Africa', 'Oceania', 'Middle East'];
const BUDGETS = ['$', '$$', '$$$', '$$$$'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

/**
 * PUBLIC_INTERFACE
 * Filter panel for Explore page supporting region, budget, and season.
 */
export default function FilterPanel({ filters, onChange }) {
  const toggleInArray = useCallback((arr, v) => {
    const set = new Set(arr || []);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    return Array.from(set);
  }, []);

  const onToggle = useCallback((key, value) => {
    const next = {
      ...filters,
      [key]: toggleInArray(filters[key] || [], value),
    };
    onChange(next);
  }, [filters, onChange, toggleInArray]);

  return (
    <div className="explore-filters" aria-label="Filters" role="group">
      <fieldset className="explore-fieldset">
        <legend className="explore-legend">Region</legend>
        <div className="explore-filter-grid">
          {REGIONS.map(r => (
            <label key={r} className="explore-checkbox">
              <input
                type="checkbox"
                checked={filters.region?.includes(r) || false}
                onChange={() => onToggle('region', r)}
                aria-checked={filters.region?.includes(r) || false}
              />
              <span>{r}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="explore-fieldset">
        <legend className="explore-legend">Budget</legend>
        <div className="explore-filter-grid">
          {BUDGETS.map(b => (
            <label key={b} className="explore-checkbox">
              <input
                type="checkbox"
                checked={filters.budget?.includes(b) || false}
                onChange={() => onToggle('budget', b)}
                aria-checked={filters.budget?.includes(b) || false}
              />
              <span>{b}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="explore-fieldset">
        <legend className="explore-legend">Season</legend>
        <div className="explore-filter-grid">
          {SEASONS.map(s => (
            <label key={s} className="explore-checkbox">
              <input
                type="checkbox"
                checked={filters.season?.includes(s) || false}
                onChange={() => onToggle('season', s)}
                aria-checked={filters.season?.includes(s) || false}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
