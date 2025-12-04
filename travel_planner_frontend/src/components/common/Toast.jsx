import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

// PUBLIC_INTERFACE
export const ToastContext = createContext(undefined);

/**
 * PUBLIC_INTERFACE
 * ToastProvider: provides a simple toast system with queue and auto-dismiss.
 * Supports variants: success, error, info, warn
 */
export function ToastProvider({ children, defaultDuration = 3500, maxToasts = 3 }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(1);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    ({ title, message, variant = 'info', duration = defaultDuration } = {}) => {
      const id = idRef.current++;
      const toast = { id, title, message, variant, duration };
      setToasts((prev) => {
        const next = [...prev, toast];
        if (next.length > maxToasts) next.shift();
        return next;
      });
      if (duration > 0) {
        setTimeout(() => remove(id), duration);
      }
      return id;
    },
    [defaultDuration, maxToasts, remove]
  );

  const api = useMemo(
    () => ({
      // PUBLIC_INTERFACE
      push,
      // PUBLIC_INTERFACE
      success: (message, opts = {}) => push({ message, variant: 'success', ...opts }),
      // PUBLIC_INTERFACE
      error: (message, opts = {}) => push({ message, variant: 'error', ...opts }),
      // PUBLIC_INTERFACE
      info: (message, opts = {}) => push({ message, variant: 'info', ...opts }),
      // PUBLIC_INTERFACE
      warn: (message, opts = {}) => push({ message, variant: 'warn', ...opts }),
      // PUBLIC_INTERFACE
      remove,
      toasts,
    }),
    [push, remove, toasts]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

// PUBLIC_INTERFACE
export function useToast() {
  /** Access toast methods: success, error, info, warn, push, remove, toasts. */
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function variantStyles(variant) {
  const base = {
    borderRadius: 'var(--radius-md)',
    padding: '10px 12px',
    display: 'grid',
    gap: 6,
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    boxShadow: 'var(--shadow-md)',
    minWidth: 260,
    maxWidth: 380,
  };
  switch (variant) {
    case 'success':
      return { ...base, borderColor: 'rgba(16,185,129,0.3)' };
    case 'error':
      return { ...base, borderColor: 'rgba(239,68,68,0.45)' };
    case 'warn':
      return { ...base, borderColor: 'rgba(245,158,11,0.45)' };
    default:
      return base;
  }
}

function ToastViewport({ toasts, onClose }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="region"
      aria-label="Notifications"
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        display: 'grid',
        gap: 10,
        zIndex: 200,
      }}
    >
      {toasts.map((t) => (
        <div key={t.id} role="status" className="transition-base" style={variantStyles(t.variant)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 14 }}>{t.title || t.variant.toUpperCase()}</strong>
            <button
              onClick={() => onClose(t.id)}
              aria-label="Dismiss notification"
              className="transition-base"
              style={{
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text)',
                borderRadius: 8,
                padding: '4px 8px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
          {t.message && <div className="text-muted" style={{ fontSize: 13 }}>{t.message}</div>}
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
