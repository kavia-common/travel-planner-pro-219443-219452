import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ItineraryView from '../components/itinerary/ItineraryView';
import CalendarItinerary from '../components/itinerary/CalendarItinerary';
import PackingList from '../components/packing/PackingList';
import BudgetDashboard from '../components/budget/BudgetDashboard';
import Card from '../components/common/Card';
import * as featureFlags from '../flags/featureFlags';
import ReminderForm from '../components/notifications/ReminderForm';
import Modal from '../components/common/Modal';
import Toast from '../components/common/Toast';
import { addReminder, listReminders, removeReminder, updateReminder, pushNotification, listNotifications, markRead } from '../services/notificationsService';
import { schedule, cancel, recover } from '../services/schedulerService';

/**
 * PUBLIC_INTERFACE
 * TripDetails page with themed tabs and header + Reminders integration.
 */
const TripDetails = () => {
  const [active, setActive] = useState('itinerary');

  // Reminders state
  const [reminders, setReminders] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toasts, setToasts] = useState([]);

  // tripId can be obtained from location or store; for demo use selected trip from URL hash or fallback
  // Since this page doesn't receive params here, scheduling will still persist per "unknown" trip; in real app wire tripId via router params.
  const tripId = 'current'; // simplified key for localStorage isolation

  const loadReminders = useCallback(async () => {
    const r = await listReminders(tripId);
    setReminders(r);
  }, [tripId]);

  useEffect(() => {
    loadReminders();
    recover(tripId);
  }, [loadReminders, tripId]);

  const scheduleForReminder = useCallback((r) => {
    const job = {
      id: `job-${r.id}`,
      reminderId: r.id,
      tripId,
      fireAt: r.fireAt,
      title: r.title || 'Reminder',
      message: r.message || '',
      repeat: r.repeat || 'none',
    };
    schedule(tripId, job);
  }, [tripId]);

  const addToast = (message) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };

  const handleCreate = async (payload) => {
    const reminder = await addReminder(tripId, payload);
    scheduleForReminder(reminder);
    setOpen(false);
    await loadReminders();
    addToast('Reminder saved');
  };

  const handleUpdate = async (payload) => {
    const updated = await updateReminder(tripId, editing.id, payload);
    cancel(`job-${editing.id}`);
    scheduleForReminder({ ...updated, id: editing.id });
    setOpen(false);
    setEditing(null);
    await loadReminders();
    addToast('Reminder updated');
  };

  const handleDelete = async (id) => {
    await removeReminder(tripId, id);
    cancel(`job-${id}`);
    await loadReminders();
    addToast('Reminder deleted');
  };

  // Quick test notification button
  const fireTest = async () => {
    await pushNotification(tripId, {
      type: 'test',
      title: 'Test notification',
      message: 'This is a test in-app notification.',
      actions: ['snooze-10m', 'dismiss'],
    });
    await listNotifications(tripId);
    addToast('Test notification sent');
  };

  const Tab = ({ id, children }) => (
    <button
      className={`tab ${active === id ? 'active' : ''}`}
      onClick={() => setActive(id)}
      role="tab"
      aria-selected={active === id}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
            <div>
              <div className="badge">Active Trip</div>
              <div style={{ fontWeight: 800, fontSize: '20px', marginTop: 6 }}>Trip Details</div>
            </div>
            <div><span className="chip chip--amber">Ocean theme</span></div>
          </div>
        </div>
        <div className="card-body">
          <div className="tabs" role="tablist" aria-label="Trip Sections">
            <Tab id="itinerary">Itinerary</Tab>
            <Tab id="calendar">Calendar</Tab>
            <Tab id="packing">Packing</Tab>
            <Tab id="budget">Budget</Tab>
          </div>
        </div>
      </div>

      {featureFlags.REMINDERS && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div className="font-semibold text-gray-800">Reminders</div>
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(true)}
                className="btn btn-primary"
              >
                Add reminder
              </button>
              <button
                onClick={fireTest}
                className="btn"
              >
                Send test
              </button>
            </div>
          </div>
          <div className="card-body">
            {reminders.length === 0 && (
              <div className="text-sm text-gray-500">No reminders yet.</div>
            )}
            <ul className="divide-y divide-gray-100">
              {reminders.map((r) => (
                <li key={r.id} className="py-3 flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{r.title}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(r.fireAt).toLocaleString()} • {r.repeat || 'none'}
                    </div>
                    {r.message && <div className="text-xs text-gray-500 mt-0.5">{r.message}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                      onClick={() => {
                        setEditing(r);
                        setOpen(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Card>
        {active === 'itinerary' && <ItineraryView />}
        {active === 'calendar' && <CalendarItinerary />}
        {active === 'packing' && <PackingList />}
        {active === 'budget' && <BudgetDashboard />}
      </Card>

      <Modal isOpen={open} onClose={() => { setOpen(false); setEditing(null); }} title={editing ? 'Edit reminder' : 'Add reminder'}>
        <ReminderForm
          initial={editing || {}}
          itineraryItems={[]}
          onCancel={() => { setOpen(false); setEditing(null); }}
          onSubmit={(payload) => (editing ? handleUpdate(payload) : handleCreate(payload))}
        />
      </Modal>

      {/* Toast container using existing Toast component */}
      <div className="fixed bottom-4 right-4 space-y-2">
        {toasts.map((t) => (
          <Toast key={t.id} message={t.message} />
        ))}
      </div>
    </div>
  );
};

export default TripDetails;
