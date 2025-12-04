import React from 'react';

/**
 * PUBLIC_INTERFACE
 * NotificationItem renders a single notification entry with read status and timestamp.
 */
export default function NotificationItem({ notification, onMarkRead }) {
  const isRead = !!notification.read;
  const time = notification.createdAt ? new Date(notification.createdAt) : null;
  const ts = time ? time.toLocaleString() : '';

  return (
    <li
      role="option"
      aria-selected={!isRead}
      tabIndex={0}
      className="transition-base"
      style={{
        display: 'grid',
        gap: 4,
        padding: '10px 12px',
        borderBottom: '1px solid var(--color-border)',
        background: isRead ? 'transparent' : 'rgba(37,99,235,0.06)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontWeight: isRead ? 500 : 700 }}>
          {notification.title || notification.type || 'Notification'}
        </div>
        {!isRead && (
          <span
            aria-hidden
            title="Unread"
            style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--color-primary-500)', display: 'inline-block', marginTop: 6 }}
          />
        )}
      </div>
      {notification.message && (
        <div className="text-muted" style={{ fontSize: 13 }}>{notification.message}</div>
      )}
      <div className="text-muted" style={{ fontSize: 12 }}>{ts}</div>
      {!isRead && (
        <div>
          <button
            type="button"
            onClick={() => onMarkRead?.(notification.id)}
            className="transition-base"
            aria-label="Mark as read"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            Mark as read
          </button>
        </div>
      )}
    </li>
  );
}
