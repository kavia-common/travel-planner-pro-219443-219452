import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';

/**
 * Modal form for creating or editing an expense.
 */

// PUBLIC_INTERFACE
export default function ExpenseForm({ open, onClose, onSubmit, initialValue }) {
  /** Form for expense create/edit
   * Props:
   *  - open: boolean
   *  - onClose: fn()
   *  - onSubmit: fn(formValue)
   *  - initialValue: expense object when editing
   */
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: '',
    date: '',
    notes: '',
    currency: 'USD',
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: initialValue?.title || '',
        amount: (initialValue?.amount ?? '') === '' ? '' : Number(initialValue.amount),
        category: initialValue?.category || '',
        date: initialValue?.date ? new Date(initialValue.date).toISOString().slice(0, 10) : '',
        notes: initialValue?.notes || '',
        currency: initialValue?.currency || 'USD',
      });
    }
  }, [open, initialValue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'amount' ? value.replace(/[^\d.]/g, '') : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      amount: Number(form.amount || 0),
      date: form.date ? new Date(form.date).toISOString() : null,
    };
    onSubmit?.(payload);
  };

  return (
    <Modal isOpen={open} onClose={onClose} ariaLabel="Expense form">
      <form onSubmit={handleSubmit}>
        <h3 style={{ marginTop: 0 }}>{initialValue ? 'Edit Expense' : 'Add Expense'}</h3>

        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required value={form.title} onChange={handleChange} />

        <label htmlFor="amount">Amount</label>
        <input id="amount" name="amount" type="number" step="0.01" min="0" required value={form.amount} onChange={handleChange} />

        <label htmlFor="currency">Currency</label>
        <input id="currency" name="currency" type="text" value={form.currency} onChange={handleChange} />

        <label htmlFor="category">Category</label>
        <input id="category" name="category" type="text" value={form.category} onChange={handleChange} placeholder="e.g., Food, Transport" />

        <label htmlFor="date">Date</label>
        <input id="date" name="date" type="date" value={form.date} onChange={handleChange} />

        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" rows="3" value={form.notes} onChange={handleChange} />

        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid #374151', borderRadius: 8, padding: '6px 12px' }}>
            Cancel
          </button>
          <button type="submit" style={{ background: 'var(--primary, #2563EB)', color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px' }}>
            {initialValue ? 'Save' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
