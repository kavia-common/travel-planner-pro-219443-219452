import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NotificationService from '../services/notificationService';
import wsClient from '../services/ws';
import { env } from '../config/env';
import { isEnabled, experimentsOn, FEATURE_NOTIFICATIONS } from '../flags/featureFlags';
import { useToast } from '../components/common/Toast';

// PUBLIC_INTERFACE
export function useNotifications({ userId, pollMs = 45000 } = {}) {
  /**
   * Notifications state and actions:
   * - Fetch notifications with loading/error states
   * - Maintain unread count
   * - Mark as read
   * - Optionally subscribe via WS when experiments and flag allow and WS is configured
   * Falls back to polling otherwise.
   */
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const toast = useToast();
  const pollTimer = useRef(null);
  const unsubRef = useRef(null);

  const enabled = isEnabled(FEATURE_NOTIFICATIONS);

  const unreadCount = useMemo(() => items.filter((n) => !n.read).length, [items]);

  const load = useCallback(
    async ({ page: p = 1, append = false } = {}) => {
      if (!enabled) return;
      setLoading(true);
      setError(null);
      try {
        const data = await NotificationService.getNotifications({ page: p, pageSize: 20, status: 'all' });
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        const next = append ? [...items, ...list] : list;
        setItems(next);
        setHasMore(!!data?.hasMore || (Array.isArray(list) && list.length === 20));
        setPage(p);
      } catch (e) {
        setError(e);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    },
    [enabled, items, toast]
  );

  const reload = useCallback(() => load({ page: 1, append: false }), [load]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      load({ page: page + 1, append: true });
    }
  }, [hasMore, loading, load, page]);

  const markAsRead = useCallback(
    async (id) => {
      if (!id) return;
      try {
        await NotificationService.markAsRead(id);
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      } catch {
        toast.warn('Could not mark notification as read');
      }
    },
    [toast]
  );

  // Polling fallback
  useEffect(() => {
    if (!enabled) return undefined;
    // initial
    reload();
    // periodic polling if WS not enabled or not configured
    const canWs = Boolean(env.wsBase) && experimentsOn() && isEnabled('liveUpdates');
    if (!canWs) {
      pollTimer.current = setInterval(reload, pollMs);
    }
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
      pollTimer.current = null;
    };
  }, [enabled, pollMs, reload]);

  // WebSocket subscription
  useEffect(() => {
    if (!enabled) return undefined;
    const canWs = Boolean(env.wsBase) && experimentsOn() && isEnabled('liveUpdates');
    if (!canWs || !userId) return undefined;

    // Ensure ws started
    wsClient.start();
    const topic = `notifications:user:${userId}`;
    unsubRef.current = wsClient.subscribe(topic, (msg) => {
      // expected { topic, event, payload }
      const evt = msg?.event;
      const payload = msg?.payload;
      if (evt === 'created' && payload) {
        setItems((prev) => [payload, ...prev]);
        if (!payload.read) toast.info('New notification received');
      } else if (evt === 'updated' && payload) {
        setItems((prev) => prev.map((n) => (n.id === payload.id ? { ...n, ...payload } : n)));
      } else if (evt === 'deleted' && payload?.id) {
        setItems((prev) => prev.filter((n) => n.id !== payload.id));
      } else if (evt === 'bulk' && Array.isArray(payload)) {
        setItems(payload);
      }
    });

    return () => {
      try {
        if (unsubRef.current) unsubRef.current();
      } catch {
        // ignore
      }
      unsubRef.current = null;
    };
  }, [enabled, userId, toast]);

  return {
    enabled,
    items,
    unreadCount,
    loading,
    error,
    hasMore,
    page,
    reload,
    loadMore,
    markAsRead,
    setItems, // escape hatch for UI ops
  };
}

export default useNotifications;
