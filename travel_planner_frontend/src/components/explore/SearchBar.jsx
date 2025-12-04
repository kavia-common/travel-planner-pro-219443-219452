import React from 'react';
import './explore.css';

/**
 * PUBLIC_INTERFACE
 * Accessible search bar for Explore page.
 */
export default function SearchBar({ value, onChange }) {
  return (
    <div className="explore-searchbar" role="search">
      <label htmlFor="explore-search-input" className="sr-only">Search destinations</label>
      <input
        id="explore-search-input"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search destinations, cities, landmarks..."
        aria-label="Search destinations"
        className="explore-input"
      />
    </div>
  );
}
