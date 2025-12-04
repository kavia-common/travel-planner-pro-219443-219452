import React from 'react';

// PUBLIC_INTERFACE
export default function Card({ title, subtitle, children, footer }) {
  /** A surface card with optional header/subtitle and footer area using polished tokens */
  return (
    <section
      className="surface rounded-md transition-base"
      style={{ padding: 'var(--space-4)', boxShadow: 'var(--shadow-md)' }}
      aria-label={title || 'Card'}
    >
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>{title}</h3>}
          {subtitle && <div className="text-muted" style={{ marginTop: 4, fontSize: 'var(--text-sm)' }}>{subtitle}</div>}
        </header>
      )}
      <div>{children}</div>
      {footer && <footer className="mt-4">{footer}</footer>}
    </section>
  );
}
