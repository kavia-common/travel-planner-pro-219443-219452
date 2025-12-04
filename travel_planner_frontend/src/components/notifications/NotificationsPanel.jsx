/* NotificationsPanel.jsx
 * Full-page panel with All / Upcoming / Past filters and browser notification setting
 */
import React, { useEffect, useMemo, useState } from 'react';
import * as featureFlags from '../../flags/featureFlags';
import {
  clearAll,
  getNotificationSettings,
  listNotifications,
  markRead,
  updateNotificationSettings,
} from '../../services/notificationsService';
import { requestNotificationPermission } from '../../services/notificationsApi';
import NotificationList from './NotificationList';

export default function NotificationsPanel({ tripId }) {
  if (!featureFlags.FEATURE_NOTIFICATIONS) return null;

  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [settings, setSettings] = useState(getNotificationSettings());

  const load = async () => {
    if (!tripId) return;
    const n = await listNotifications(tripId);
    setItems(n);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const filtered = useMemo(() => {
    const now = Date.now();
    if (filter === 'upcoming') {
      return items.filter((i) => new Date(i.createdAt).getTime() >= now - 5 * 60 * 1000);
    }
    if (filter === 'past') {
      return items.filter((i) => new Date(i.createdAt).getTime() < now - 5 * 60 * 1000);
    }
    return items;
  }, [items, filter]);

  const handleMarkRead = async (id) => {
    await markRead(tripId, id);
    await load();
  };

  const handleClearAll = async () => {
    await clearAll(tripId);
    await load();
  };

  const toggleBrowserNotifications = async () => {
    if (!featureFlags.BROWSER_NOTIFICATIONS) return;
    const next = !settings.enableBrowserNotifications;
    if (next) {
      await requestNotificationPermission();
    }
    const updated = updateNotificationSettings({ enableBrowserNotifications: next });
    setSettings(updated);
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-gray-50">
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="browserNotifications"
                checked={!!settings.enableBrowserNotifications}
                onChange={toggleBrowserNotifications}
              />
              <label htmlFor="browserNotifications" className="text-sm text-gray-700">
                Enable browser notifications
              </label>
            </div>
            <button
              onClick={handleClearAll}
              className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="px-4 py-2 border-b border-gray-100">
          <div className="inline-flex rounded-md shadow-sm overflow-hidden">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1.5 text-sm ${filter === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-3 py-1.5 text-sm ${filter === 'past' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}`}
            >
              Past
            </button>
          </div>
        </div>

        <div className="p-4">
          <NotificationList items={filtered} onItemClick={handleMarkRead} />
          {filtered.length === 0 && (
            <div className="text-sm text-gray-500">No notifications to show</div>
          )}
        </div>
      </div>
    </div>
  );
}
