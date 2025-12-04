import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Themed Sidebar container for navigation or contextual content.
 */
const Sidebar = ({ children, className = '' }) => {
  return (
    <aside className={`sidebar surface surface--muted ${className}`.trim()} style={{padding: '16px'}}>
      {children}
    </aside>
  );
};

export default Sidebar;
