import React from 'react';

// PUBLIC_INTERFACE
export default function Card({ title, subtitle, children, footer }) {
  /** A surface card with optional header/subtitle and footer area */
  return (
    <section className="surface rounded-md shadow-sm transition-base" style={{ padding: '1rem' }} aria-label={title || 'Card'}>
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>}
          {subtitle && <div className="text-muted" style={{ marginTop: 4, fontSize: 13 }}>{subtitle}</div>}
        </header>
      )}
      <div>{children}</div>
      {footer && <footer className="mt-4">{footer}</footer>}
    </section>
  );
}
