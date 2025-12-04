/* NotificationsBell.jsx
 * Header icon with unread badge and dropdown list of recent notifications
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as featureFlags from '../../flags/featureFlags';
import { listNotifications, markRead } from '../../services/notificationsService';
import NotificationList from './NotificationList';

export default function NotificationsBell({ tripId }) {
  // Hooks must be called unconditionally
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  // If feature disabled or no tripId, render nothing (after hooks are declared)
  const disabled = !featureFlags.FEATURE_NOTIFICATIONS || !tripId;

  useEffect(() => {
    if (disabled) return undefined;
    let isMounted = true;
    const load = async () => {
      const n = await listNotifications(tripId);
      if (isMounted) setItems(n);
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      isMounted = false;
      clearInterval(id);
    };
  }, [tripId, disabled]);

  useEffect(() => {
    if (disabled) return undefined;
    function onDocClick(e) {
      if (open && ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open, disabled]);

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items]);

  const onItemClick = async (id) => {
    await markRead(tripId, id);
    const n = await listNotifications(tripId);
    setItems(n);
  };

  if (disabled) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-blue-600 hover:bg-blue-50 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M14.5 17h-5m8 0a3.5 3.5 0 01-7 0m7 0h1a2 2 0 002-2v-3a7 7 0 10-14 0v3a2 2 0 002 2h1" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-xs rounded-full px-1 shadow">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden animate-[fadeIn_150ms_ease-out]">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-50 to-gray-50 text-sm font-medium text-gray-700">
            Notifications
          </div>
          <div className="max-h-96 overflow-auto">
            <NotificationList items={items.slice(0, 10)} onItemClick={onItemClick} />
            {items.length === 0 && (
              <div className="p-4 text-sm text-gray-500">No notifications yet</div>
            )}
          </div>
          <div className="px-4 py-2 text-right">
            <a href="/notifications" className="text-blue-600 text-sm hover:underline">View all</a>
          </div>
        </div>
      )}
    </div>
  );
}
