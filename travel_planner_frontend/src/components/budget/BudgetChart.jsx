import React, { useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * BudgetChart
 * Lightweight bar visualization for per-category amounts.
 * Props:
 * - perCategory: object { category: amount }
 * - currency: display currency code
 */
const BudgetChart = ({ perCategory = {}, currency = 'USD' }) => {
  const entries = useMemo(() => Object.entries(perCategory || {}), [perCategory]);
  const max = useMemo(() => Math.max(0, ...entries.map(([, v]) => v)), [entries]);

  if (!entries.length) {
    return <div className="text-sm text-gray-500">No data to visualize.</div>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([cat, val]) => {
        const width = max > 0 ? Math.max(2, Math.round((val / max) * 100)) : 0;
        return (
          <div key={cat}>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{cat}</span>
              <span>{currency} {val.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full"
                style={{ width: `${width}%`, backgroundColor: '#2563EB' }}
                title={`${cat}: ${currency} ${val.toFixed(2)}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BudgetChart;
