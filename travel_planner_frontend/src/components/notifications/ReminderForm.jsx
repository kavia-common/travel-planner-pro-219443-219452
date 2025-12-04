/* ReminderForm.jsx
 * Create/edit reminders with target entity, date/time, message, repeat option
 */
import React, { useEffect, useState } from 'react';

const defaultForm = {
  targetType: 'trip', // trip | item
  targetId: null,
  title: '',
  message: '',
  date: '',
  time: '',
  repeat: 'none', // none | daily | once
};

export default function ReminderForm({ initial = {}, onSubmit, onCancel, itineraryItems = [] }) {
  const [form, setForm] = useState({ ...defaultForm, ...initial });

  useEffect(() => {
    setForm((f) => ({ ...f, ...initial }));
  }, [initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.time) return;
    const fireAt = new Date(`${form.date}T${form.time}:00`).toISOString();
    onSubmit({ ...form, fireAt });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Reminder title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Optional message"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
          <select
            name="targetType"
            value={form.targetType}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="trip">Trip</option>
            <option value="item">Itinerary item</option>
          </select>
        </div>
        {form.targetType === 'item' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Itinerary item</label>
            <select
              name="targetId"
              value={form.targetId || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="">Select an item</option>
              {itineraryItems.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.title || it.name || 'Item'} ({it.date || it.startDate})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
        <select
          name="repeat"
          value={form.repeat}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="none">None</option>
          <option value="once">Once</option>
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          Save reminder
        </button>
      </div>
    </form>
  );
}
