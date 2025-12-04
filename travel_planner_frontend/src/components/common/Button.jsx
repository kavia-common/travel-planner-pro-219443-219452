import React from 'react';

// PUBLIC_INTERFACE
export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, ariaLabel }) {
  /** A themed button supporting primary, secondary, and ghost variants */
  const base = {
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-base)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      background: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--color-secondary)',
      border: '1px solid var(--color-secondary)',
      color: '#111827',
    },
    ghost: {
      background: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text)',
    },
  };

  const style = { ...base, ...(variants[variant] || variants.primary) };

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      style={style}
      className="transition-base shadow-sm"
    >
      {children}
    </button>
  );
}
