import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Themed Card component with optional header title.
 * Props:
 * - title?: string
 * - subtitle?: string
 * - headerRight?: ReactNode
 * - className?: string
 */
const Card = ({ title, children, className = '', headerRight = null, subtitle }) => (
  <div className={`card surface ${className}`.trim()} tabIndex={0}>
    {(title || headerRight) && (
      <div className="card-header">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
          <div>
            {title && <h3 className="card-title" style={{ margin: 0 }}>{title}</h3>}
            {subtitle && <div className="text-muted" style={{ fontSize: 14, marginTop: 4 }}>{subtitle}</div>}
          </div>
          {headerRight}
        </div>
      </div>
    )}
    <div className="card-body">{children}</div>
  </div>
);

export default Card;
