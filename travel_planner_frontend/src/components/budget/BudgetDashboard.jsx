import React, { useEffect, useMemo, useState } from 'react';
import BudgetSummary from './BudgetSummary';
import BudgetChart from './BudgetChart';
import ExpenseList from './ExpenseList';
import { getPlannedBudget, setPlannedBudget, getSettings, setSettings, listExpenses } from '../../services/budgetService';
import { getSupportedCurrencies, convertAmount, getBaseCurrency, setBaseCurrency } from '../../services/currencyService';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * PUBLIC_INTERFACE
 * BudgetDashboard
 * This component provides an overview of trip budget: totals, per-category breakdown, planned budget, and currency selection.
 * Props:
 * - tripId: string | number - the ID of the trip whose budget to display
 */
const BudgetDashboard = ({ tripId }) => {
  const [expenses, setExpenses] = useState([]);
  const [plannedBudget, setPlannedBudgetState] = useState(null);
  const [baseCurrency, setBaseCurrencyState] = useState(getBaseCurrency());
  const [loading, setLoading] = useState(true);
  const supportedCurrencies = getSupportedCurrencies();

  // Load initial data
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [exp, pb, settings] = await Promise.all([
          listExpenses(tripId),
          getPlannedBudget(tripId),
          getSettings(tripId),
        ]);
        if (!mounted) return;
        setExpenses(exp || []);
        if (pb !== undefined && pb !== null) {
          setPlannedBudgetState(Number(pb));
        }
        if (settings?.baseCurrency) {
          setBaseCurrencyState(settings.baseCurrency);
        }
      } catch (e) {
        // best effort; UI will still function with defaults
        // eslint-disable-next-line no-console
        console.warn('BudgetDashboard load error', e);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [tripId]);

  const totals = useMemo(() => {
    const perCategory = {};
    let total = 0;
    for (const exp of expenses) {
      const converted = convertAmount(exp.amount, exp.currency, baseCurrency);
      total += converted;
      perCategory[exp.category] = (perCategory[exp.category] || 0) + converted;
    }
    return { total, perCategory };
  }, [expenses, baseCurrency]);

  const remaining = useMemo(() => {
    if (typeof plannedBudget === 'number' && !Number.isNaN(plannedBudget)) {
      return plannedBudget - totals.total;
    }
    return null;
  }, [plannedBudget, totals.total]);

  const handlePlannedBudgetSave = async (value) => {
    const valNum = Number(value);
    if (Number.isFinite(valNum) && valNum >= 0) {
      await setPlannedBudget(tripId, valNum);
      setPlannedBudgetState(valNum);
    }
  };

  const handleCurrencyChange = async (e) => {
    const newCur = e.target.value;
    setBaseCurrencyState(newCur);
    await setSettings(tripId, { baseCurrency: newCur });
    setBaseCurrency(newCur);
  };

  const onExpensesChange = (updated) => {
    setExpenses(updated);
  };

  if (loading) {
    return (
      <div className="p-4 text-sm text-gray-600">Loading budget...</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="col-span-1">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Base Currency</h3>
          </div>
          <select
            value={baseCurrency}
            onChange={handleCurrencyChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {supportedCurrencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">Displayed totals converted to {baseCurrency}.</p>
        </Card>

        <BudgetSummary
          className="col-span-1"
          totalSpent={totals.total}
          plannedBudget={plannedBudget}
          remaining={remaining}
          currency={baseCurrency}
          onSavePlannedBudget={handlePlannedBudgetSave}
        />

        <Card className="col-span-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Planned Budget</h3>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder={`Enter amount in ${baseCurrency}`}
              defaultValue={plannedBudget ?? ''}
              className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onBlur={(e) => handlePlannedBudgetSave(e.target.value)}
            />
            <Button
              variant="primary"
              onClick={() => {
                const input = document.querySelector('#plannedBudgetInput');
                if (input) handlePlannedBudgetSave(input.value);
              }}
              style={{ backgroundColor: '#2563EB' }}
            >
              Save
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Optional planned budget for this trip.</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Breakdown</h3>
          <BudgetChart perCategory={totals.perCategory} currency={baseCurrency} />
          <ul className="mt-3 text-sm text-gray-700 space-y-1">
            {Object.entries(totals.perCategory).length === 0 && (
              <li className="text-gray-500">No expenses yet.</li>
            )}
            {Object.entries(totals.perCategory).map(([cat, val]) => (
              <li key={cat} className="flex justify-between">
                <span>{cat}</span>
                <span>{baseCurrency} {val.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="col-span-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Totals</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Total Spent</span>
              <span className="font-semibold">{baseCurrency} {totals.total.toFixed(2)}</span>
            </div>
            {typeof plannedBudget === 'number' && (
              <>
                <div className="flex justify-between">
                  <span>Planned Budget</span>
                  <span>{baseCurrency} {plannedBudget.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between ${remaining < 0 ? 'text-red-600' : 'text-green-700'}`}>
                  <span>Remaining</span>
                  <span className="font-semibold">{baseCurrency} {remaining.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <ExpenseList
          tripId={tripId}
          currency={baseCurrency}
          onChange={onExpensesChange}
        />
      </Card>
    </div>
  );
};

export default BudgetDashboard;
