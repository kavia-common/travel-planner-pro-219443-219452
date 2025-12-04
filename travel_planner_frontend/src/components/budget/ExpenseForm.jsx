import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import { getSupportedCurrencies } from '../../services/currencyService';

const DEFAULT_CATEGORIES = ['Transport', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Fees', 'Misc'];

/**
 * PUBLIC_INTERFACE
 * ExpenseForm
 * Props:
 * - initial: optional expense {id,date,description,category,amount,currency}
 * - onSave(payload)
 * - onCancel()
 */
const ExpenseForm = ({ initial, onSave, onCancel }) => {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState(initial?.date ? initial.date.slice(0,10) : today);
  const [description, setDescription] = useState(initial?.description || '');
  const [category, setCategory] = useState(initial?.category || DEFAULT_CATEGORIES[0]);
  const [amount, setAmount] = useState(initial?.amount ?? '');
  const [currency, setCurrency] = useState(initial?.currency || 'USD');
  const [error, setError] = useState('');
  const currencies = getSupportedCurrencies();

  const validate = () => {
    if (!description.trim()) return 'Description is required';
    if (!category) return 'Category is required';
    const val = Number(amount);
    if (!Number.isFinite(val) || val <= 0) return 'Amount must be a positive number';
    if (!currency) return 'Currency is required';
    if (!date) return 'Date is required';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError('');
    onSave({
      date: new Date(date).toISOString(),
      description: description.trim(),
      category,
      amount: Number(amount),
      currency,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-md shadow-sm p-3 border">
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="w-full p-2 border rounded-md" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Description</label>
          <input type="text" value={description} onChange={(e)=>setDescription(e.target.value)} className="w-full p-2 border rounded-md" placeholder="e.g., Taxi from airport" />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Category</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full p-2 border rounded-md">
            {DEFAULT_CATEGORIES.map((c)=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Amount</label>
          <input type="number" min="0" step="0.01" value={amount} onChange={(e)=>setAmount(e.target.value)} className="w-full p-2 border rounded-md" placeholder="0.00" />
        </div>
        <div className="md:col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Currency</label>
          <select value={currency} onChange={(e)=>setCurrency(e.target.value)} className="w-full p-2 border rounded-md">
            {currencies.map((c)=> <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button type="submit" variant="primary" style={{ backgroundColor: '#2563EB' }}>
          {initial ? 'Update' : 'Add'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} style={{ backgroundColor: '#F59E0B' }}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
