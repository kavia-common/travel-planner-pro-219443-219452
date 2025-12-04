import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getBudget,
  updateBudget,
} from '../services/budgetService';

/**
 * Hook to manage budget and expenses for a trip.
 * Provides CRUD APIs and derived state such as totals, remaining, and category breakdown.
 */

// PUBLIC_INTERFACE
export default function useBudget(tripId, { onToast } = {}) {
  /** Hook to manage budget and expenses for a trip id.
   * Params:
   *  - tripId: string | number
   *  - onToast?: function({type, message})
   * Returns state, computed totals, and CRUD methods.
   */
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState({ target: 0, currency: 'USD' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toast = (type, message) => {
    if (typeof onToast === 'function') onToast({ type, message });
  };

  const refresh = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [expRes, budRes] = await Promise.all([
        getExpenses(tripId),
        getBudget(tripId),
      ]);
      setExpenses(Array.isArray(expRes?.data) ? expRes.data : expRes || []);
      const bData = budRes?.data ?? budRes ?? {};
      setBudget({
        target: Number(bData.target ?? 0),
        currency: bData.currency || 'USD',
      });
    } catch (e) {
      setError(e);
      toast('error', 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totals = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const target = Number(budget.target || 0);
    const remaining = Math.max(target - total, 0);
    const progress = target > 0 ? Math.min((total / target) * 100, 100) : 0;

    // Category breakdown
    const byCategory = expenses.reduce((acc, e) => {
      const key = (e.category || 'Uncategorized').trim() || 'Uncategorized';
      acc[key] = (acc[key] || 0) + Number(e.amount || 0);
      return acc;
    }, {});
    const breakdown = Object.entries(byCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { total, target, remaining, progress, currency: budget.currency, breakdown };
  }, [expenses, budget]);

  const addExpense = useCallback(
    async (payload) => {
      if (!tripId) return;
      try {
        const res = await createExpense(tripId, payload);
        const entity = res?.data ?? res;
        setExpenses((prev) => [entity, ...prev]);
        toast('success', 'Expense added');
      } catch (e) {
        setError(e);
        toast('error', 'Failed to add expense');
        throw e;
      }
    },
    [tripId]
  );

  const editExpense = useCallback(
    async (expenseId, updates) => {
      if (!tripId || !expenseId) return;
      try {
        const res = await updateExpense(tripId, expenseId, updates);
        const entity = res?.data ?? res;
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? { ...e, ...entity } : e)));
        toast('success', 'Expense updated');
      } catch (e) {
        setError(e);
        toast('error', 'Failed to update expense');
        throw e;
      }
    },
    [tripId]
  );

  const removeExpense = useCallback(
    async (expenseId) => {
      if (!tripId || !expenseId) return;
      try {
        await deleteExpense(tripId, expenseId);
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        toast('success', 'Expense deleted');
      } catch (e) {
        setError(e);
        toast('error', 'Failed to delete expense');
        throw e;
      }
    },
    [tripId]
  );

  const setBudgetTarget = useCallback(
    async (target, extra = {}) => {
      if (!tripId) return;
      try {
        const res = await updateBudget(tripId, { target, ...extra });
        const data = res?.data ?? res ?? {};
        setBudget((prev) => ({ ...prev, target: Number(data.target ?? target), currency: data.currency || prev.currency }));
        toast('success', 'Budget updated');
      } catch (e) {
        setError(e);
        toast('error', 'Failed to update budget');
        throw e;
      }
    },
    [tripId]
  );

  return {
    expenses,
    budget,
    loading,
    error,
    totals,
    refresh,
    addExpense,
    editExpense,
    removeExpense,
    setBudgetTarget,
  };
}
