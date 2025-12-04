import React, { useEffect, useMemo, useState } from 'react';
import { addExpense, listExpenses, removeExpense, updateExpense } from '../../services/budgetService';
import ExpenseForm from './ExpenseForm';
import Button from '../common/Button';
import { convertAmount } from '../../services/currencyService';

/**
 * PUBLIC_INTERFACE
 * ExpenseList
 * Shows a list/table of expenses with add/edit/delete and currency conversion display.
 * Props:
 * - tripId: string | number
 * - currency: string (base display currency)
 * - onChange: function(updatedExpenses) -> void
 */
const ExpenseList = ({ tripId, currency, onChange }) => {
  const [expenses, setExpenses] = useState([]);
  const [editing, setEditing] = useState(null); // expense or null
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      const exp = await listExpenses(tripId);
      if (mounted) {
        setExpenses(exp || []);
        onChange && onChange(exp || []);
      }
    }
    load();
    return () => { mounted = false; };
  }, [tripId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async (payload) => {
    const saved = await addExpense(tripId, payload);
    const updated = [...expenses, saved];
    setExpenses(updated);
    onChange && onChange(updated);
    setShowForm(false);
  };

  const handleUpdate = async (id, patch) => {
    const saved = await updateExpense(tripId, id, patch);
    const updated = expenses.map(e => e.id === id ? saved : e);
    setExpenses(updated);
    onChange && onChange(updated);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    await removeExpense(tripId, id);
    const updated = expenses.filter(e => e.id !== id);
    setExpenses(updated);
    onChange && onChange(updated);
  };

  const rows = useMemo(() => {
    return (expenses || []).slice().sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [expenses]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Expenses</h3>
        <Button variant="primary" onClick={() => { setShowForm(true); setEditing(null); }} style={{ backgroundColor: '#2563EB' }}>
          Add Expense
        </Button>
      </div>

      {showForm && !editing && (
        <div className="mb-4">
          <ExpenseForm
            onCancel={() => setShowForm(false)}
            onSave={handleAdd}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-2 pr-4">Date</th>
              <th className="py-2 pr-4">Description</th>
              <th className="py-2 pr-4">Category</th>
              <th className="py-2 pr-4">Amount</th>
              <th className="py-2 pr-4">In {currency}</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-500">No expenses yet. Add your first expense.</td>
              </tr>
            )}
            {rows.map((exp) => {
              const converted = convertAmount(exp.amount, exp.currency, currency);
              return (
                <tr key={exp.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 whitespace-nowrap">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="py-2 pr-4">{exp.description}</td>
                  <td className="py-2 pr-4">{exp.category}</td>
                  <td className="py-2 pr-4">{exp.currency} {Number(exp.amount).toFixed(2)}</td>
                  <td className="py-2 pr-4">{currency} {converted.toFixed(2)}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => setEditing(exp)} style={{ backgroundColor: '#F59E0B' }}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(exp.id)}>
                        Delete
                      </Button>
                    </div>
                    {editing && editing.id === exp.id && (
                      <div className="mt-3">
                        <ExpenseForm
                          initial={exp}
                          onCancel={() => setEditing(null)}
                          onSave={(payload) => handleUpdate(exp.id, payload)}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
