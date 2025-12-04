import React, { useEffect } from 'react';

// PUBLIC_INTERFACE
export default function Modal({ open, onClose, title = 'Dialog', children, ariaDescribedBy, ariaLabelledBy }) {
  /**
   * Accessible modal: traps scroll behind, closes on Escape, backdrop click closes.
   */
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && open) onClose?.();
    }
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      className="transition-base"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div className="surface rounded-lg shadow-lg" style={{ width: 'min(600px, 92vw)', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 id={ariaLabelledBy} style={{ margin: 0, fontSize: 20 }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="transition-base"
            style={{
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              borderRadius: 8,
              padding: '6px 10px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        <div id={ariaDescribedBy}>{children}</div>
      </div>
    </div>
  );
}
