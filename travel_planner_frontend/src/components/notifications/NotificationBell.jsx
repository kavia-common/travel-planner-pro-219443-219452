import React, { useEffect, useRef, useState } from 'react';
import useNotifications from '../../hooks/useNotifications';
import { FEATURE_NOTIFICATIONS, isEnabled } from '../../flags/featureFlags';
import NotificationList from './NotificationList';

// Simple user id provider placeholder; in real app, derive from auth/user state.
// For now we assume current user context is not available; leave undefined to use polling.
// If userService exists with getCurrentUser, we could integrate later.

/**
 * PUBLIC_INTERFACE
 * NotificationBell renders an icon button with an unread badge and toggles a panel listing notifications.
 * ARIA: button with aria-haspopup=listbox, aria-expanded state, and badge with aria-label for unread count.
 */
export default function NotificationBell() {
  const gate = isEnabled(FEATURE_NOTIFICATIONS);
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);

  const { unreadCount, items, loading, error, reload, markAsRead, loadMore, hasMore } = useNotifications({ userId: undefined });

  useEffect(() => {
    function onDocKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', onDocKey);
    return () => document.removeEventListener('keydown', onDocKey);
  }, [open]);

  if (!gate) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="transition-base"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        title="Notifications"
        style={{
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          position: 'relative',
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              borderRadius: 9,
              background: 'var(--color-primary-500)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              padding: '0 4px',
              border: '1px solid var(--color-primary-600)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          aria-modal="false"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: 8,
            width: 360,
            maxHeight: 420,
            overflow: 'auto',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 100,
          }}
        >
          <NotificationList
            items={items}
            loading={loading}
            error={error}
            onReload={reload}
            onMarkRead={markAsRead}
            onLoadMore={loadMore}
            hasMore={hasMore}
            onClose={() => setOpen(false)}
            anchorRef={btnRef}
          />
        </div>
      )}
    </div>
  );
}
