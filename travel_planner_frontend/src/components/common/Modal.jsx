import React, { useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
export default function Modal({ open, onClose, title = 'Dialog', children, ariaDescribedBy, ariaLabelledBy, initialFocusRef }) {
  /**
   * Accessible modal with polished visuals and motion
   */
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const prevFocusRef = useRef(null);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape' && open) onClose?.();
      if (e.key === 'Tab' && open) {
        const focusable = getFocusable(containerRef.current);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;

        if (e.shiftKey) {
          if (current === first || !containerRef.current.contains(current)) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (current === last || !containerRef.current.contains(current)) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    function getFocusable(root) {
      if (!root) return [];
      const selectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      return Array.from(root.querySelectorAll(selectors.join(','))).filter(
        (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden')
      );
    }

    if (open) {
      prevFocusRef.current = document.activeElement;
      document.addEventListener('keydown', handleKey);
      // trap scroll
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // try initial focus
      setTimeout(() => {
        const target = initialFocusRef?.current || getFocusable(containerRef.current)[0];
        target?.focus();
      }, 0);

      // mark main as aria-hidden to screen readers (simple approach)
      const mains = document.querySelectorAll('main, [role="main"]');
      mains.forEach((m) => m.setAttribute('aria-hidden', 'true'));

      return () => {
        document.removeEventListener('keydown', handleKey);
        document.body.style.overflow = prevOverflow || '';
        mains.forEach((m) => m.removeAttribute('aria-hidden'));
        // restore focus
        prevFocusRef.current && typeof prevFocusRef.current.focus === 'function' && prevFocusRef.current.focus();
      };
    }
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
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
        background: 'rgba(2, 6, 23, 0.55)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        ref={containerRef}
        className="surface-elevated rounded-lg"
        style={{ width: 'min(640px, 92vw)', padding: 'var(--space-4)', transform: 'translateY(0)' }}
        role="document"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 id={ariaLabelledBy} style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="btn-base transition-base"
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
