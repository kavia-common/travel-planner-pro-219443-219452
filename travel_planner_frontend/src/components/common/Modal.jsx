import React, { useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
export default function Modal({ open, onClose, title = 'Dialog', children, ariaDescribedBy, ariaLabelledBy, initialFocusRef }) {
  /**
   * Accessible modal:
   * - traps scroll behind
   * - closes on Escape
   * - backdrop click closes
   * - focus trap with cycling tab
   * - returns focus to previously focused element on close
   * - sets aria attributes
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
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 100,
      }}
    >
      <div
        ref={containerRef}
        className="surface rounded-lg shadow-lg"
        style={{ width: 'min(600px, 92vw)', padding: '1rem' }}
        role="document"
      >
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
