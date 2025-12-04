import React from 'react';

// PUBLIC_INTERFACE
export default function Button({ children, variant = 'primary', onClick, type = 'button', disabled = false, ariaLabel }) {
  /** A themed button supporting primary, secondary, and ghost variants with improved motion and focus states */
  const base = {
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-base)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    opacity: disabled ? 0.6 : 1,
    boxShadow: 'var(--shadow-sm)',
  };

  const variants = {
    primary: {
      background: 'linear-gradient(180deg, var(--color-primary-500), var(--color-primary-600))',
      border: '1px solid var(--color-primary-600)',
      color: '#fff',
    },
    secondary: {
      background: 'linear-gradient(180deg, rgba(245,158,11,0.95), var(--color-secondary))',
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
      className="btn-base transition-base"
      onMouseEnter={() => {}}
    >
      {children}
    </button>
  );
}
