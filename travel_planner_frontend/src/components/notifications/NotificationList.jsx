import React from 'react';
import NotificationItem from './NotificationItem';

/**
 * PUBLIC_INTERFACE
 * NotificationList displays a list of notifications with error/empty/loading states and actions.
 */
export default function NotificationList({
  items = [],
  loading = false,
  error = null,
  onReload,
  onMarkRead,
  onLoadMore,
  hasMore = false,
  onClose,
  anchorRef,
}) {
  return (
    <div role="document" tabIndex={-1}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid var(--color-border)' }}>
        <strong>Notifications</strong>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={onReload}
            className="transition-base"
            aria-label="Refresh notifications"
            style={{ border: '1px solid var(--color-border)', background: 'transparent', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
          >
            ⟳
          </button>
          <button
            type="button"
            onClick={onClose}
            className="transition-base"
            aria-label="Close panel"
            style={{ border: '1px solid var(--color-border)', background: 'transparent', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>

      {loading && (
        <div role="status" aria-live="polite" className="text-muted" style={{ padding: 12 }}>
          Loading…
        </div>
      )}
      {error && !loading && (
        <div role="alert" style={{ padding: 12, color: 'var(--color-text)' }}>
          Failed to load notifications.
        </div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="text-muted" style={{ padding: 12 }}>You have no notifications.</div>
      )}

      <ul role="listbox" aria-label="Notifications list" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((n) => (
          <NotificationItem key={n.id || `${n.type}-${n.createdAt}`} notification={n} onMarkRead={onMarkRead} />
        ))}
      </ul>

      {hasMore && (
        <div style={{ padding: 10, borderTop: '1px solid var(--color-border)' }}>
          <button
            type="button"
            onClick={onLoadMore}
            className="transition-base"
            style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', width: '100%' }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
