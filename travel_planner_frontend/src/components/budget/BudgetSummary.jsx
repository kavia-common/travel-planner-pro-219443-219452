import React from 'react';
import Card from '../common/Card';

const format = (n) => (Number.isFinite(n) ? n.toFixed(2) : '0.00');

/**
 * PUBLIC_INTERFACE
 * BudgetSummary
 * Props:
 * - totalSpent: number
 * - plannedBudget: number | null
 * - remaining: number | null
 * - currency: string
 * - onSavePlannedBudget: (value: number) => Promise<void>
 */
const BudgetSummary = ({ totalSpent = 0, plannedBudget = null, remaining = null, currency = 'USD', className = '' }) => {
  return (
    <Card className={className}>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Total Spent</span>
          <span className="font-semibold">{currency} {format(totalSpent)}</span>
        </div>
        {typeof plannedBudget === 'number' && (
          <>
            <div className="flex justify-between">
              <span>Planned Budget</span>
              <span>{currency} {format(plannedBudget)}</span>
            </div>
            <div className={`flex justify-between ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
              <span>Remaining</span>
              <span className="font-semibold">{currency} {format(remaining)}</span>
            </div>
          </>
        )}
        {plannedBudget === null && (
          <p className="text-xs text-gray-500">Tip: set a planned budget to track remaining amount.</p>
        )}
      </div>
    </Card>
  );
};

export default BudgetSummary;
