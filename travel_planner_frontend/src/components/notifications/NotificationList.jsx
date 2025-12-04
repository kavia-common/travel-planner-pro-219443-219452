import React from 'react';

export default function NotificationList({ items = [], onItemClick, onAction }) {
  return (
    <ul className="divide-y divide-gray-100">
      {items.map((n) => (
        <li key={n.id || `${n.type}-${n.createdAt}`} className="p-3 hover:bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="pr-3">
              <div className="text-sm font-medium text-gray-800">{n.title || 'Notification'}</div>
              {n.message && <div className="text-xs text-gray-600 mt-0.5">{n.message}</div>}
              <div className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              {!n.read && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full">New</span>}
              <button
                className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100"
                onClick={() => onItemClick?.(n.id)}
              >
                Mark read
              </button>
            </div>
          </div>
          {(n.actions && n.actions.length > 0) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {n.actions.includes('snooze-10m') && (
                <button
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => onAction?.(n, 'snooze-10m')}
                >
                  Snooze +10m
                </button>
              )}
              {n.actions.includes('snooze-1h') && (
                <button
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => onAction?.(n, 'snooze-1h')}
                >
                  Snooze +1h
                </button>
              )}
              {n.actions.includes('mark-done') && (
                <button
                  className="text-xs px-2 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => onAction?.(n, 'mark-done')}
                >
                  Mark done
                </button>
              )}
              {n.actions.includes('dismiss') && (
                <button
                  className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-700 hover:bg-gray-100"
                  onClick={() => onAction?.(n, 'dismiss')}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
