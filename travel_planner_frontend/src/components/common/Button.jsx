import React from 'react';

/**
 * PUBLIC_INTERFACE
 * A themed button component with Ocean Professional styles.
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost'
 * - type: button type
 * - className: additional classes
 * - disabled: boolean
 * - onClick: click handler
 * - ariaLabel: optional aria-label
 */
const Button = ({ children, onClick, type = 'button', className = '', disabled = false, variant = 'primary', ariaLabel }) => {
  const variantClass =
    variant === 'primary'
      ? 'btn-primary'
      : variant === 'secondary'
      ? 'btn-secondary'
      : variant === 'ghost'
      ? 'btn-ghost'
      : '';

  return (
    <button
      type={type}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`btn ${variantClass} ${className}`.trim()}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
