import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import PlaceResult from './PlaceResult';
import RecentSearches from './RecentSearches';
import PlacesService from '../../services/placesService';
import ItineraryService from '../../services/itineraryService';

// Helpers
function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

function loadRecent() {
  try {
    const raw = sessionStorage.getItem('RECENT_PLACES_QUERIES') || '[]';
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 8) : [];
  } catch {
    return [];
  }
}
function saveRecent(query) {
  try {
    const arr = loadRecent().filter((q) => q !== query);
    arr.unshift(query);
    sessionStorage.setItem('RECENT_PLACES_QUERIES', JSON.stringify(arr.slice(0, 8)));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export default function PlacesSearch({ tripId, nearestDate }) {
  /** Search bar and results list for places, with ability to add to itinerary or destinations. */
  const [q, setQ] = useState('');
  const debouncedQ = useDebounced(q, 300);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [highlight, setHighlight] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const recent = useMemo(() => loadRecent(), [q]);

  const fetchResults = useCallback(async () => {
    const query = debouncedQ.trim();
    if (!query) {
      setItems([]);
      setError('');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await PlacesService.search(query);
      setItems(res.slice(0, 10));
      saveRecent(query);
    } catch (e) {
      setError('Search failed. Try again.');
    } finally {
      setLoading(false);
    }
  }, [debouncedQ]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // Keyboard navigation
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setQ('');
        setItems([]);
        setHighlight(-1);
        inputRef.current?.focus();
      }
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (h + 1) % items.length);
        listRef.current?.scrollTo?.({ top: 9999, behavior: 'smooth' });
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (h - 1 + items.length) % items.length);
      }
      if (e.key === 'Enter' && highlight >= 0) {
        e.preventDefault();
        const sel = items[highlight];
        handleAdd({ mode: 'itinerary-today', place: sel });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items, highlight]);

  async function handleAdd({ mode, place, date }) {
    if (mode === 'destinations') {
      // If there is a destinations service, integrate here. For now, noop with toast-like UX.
      // eslint-disable-next-line no-alert
      alert(`Saved "${place.name}" to Destinations (demo).`);
      return;
    }

    // itinerary-today or itinerary-date
    const targetDate = date || nearestDate || new Date().toISOString().slice(0, 10);
    try {
      await ItineraryService.addItineraryItemFromPlace(tripId, place, targetDate);
      // eslint-disable-next-line no-alert
      alert(`Added "${place.name}" to itinerary on ${targetDate}.`);
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert('Failed to add itinerary item.');
    }
  }

  return (
    <div className="space-y-3">
      <Card title="Find places" subtitle="Search places and add them to your trip itinerary.">
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for places, e.g., 'museum Paris'..."
            aria-label="Search places"
            className="transition-base"
            onFocus={() => {
              // show recent area only when empty
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              boxShadow: 'var(--shadow-sm)',
            }}
          />
          <Button variant="primary" onClick={fetchResults} ariaLabel="Search places">
            Search
          </Button>
        </div>
        {!q && (
          <RecentSearches
            items={recent}
            onSelect={(v) => {
              setQ(v);
              setTimeout(fetchResults, 0);
            }}
          />
        )}
      </Card>

      <div
        ref={listRef}
        style={{
          display: 'grid',
          gap: 8,
          maxHeight: 420,
          overflow: 'auto',
          paddingRight: 4,
        }}
        aria-live="polite"
      >
        {loading && <div role="status">Searching places...</div>}
        {!loading && error && <div role="alert" style={{ color: '#EF4444' }}>{error}</div>}
        {!loading && !error && q && items.length === 0 && (
          <div>No places found for “{q}”. Try a different query.</div>
        )}
        {!loading &&
          items.map((p, idx) => (
            <div
              key={p.id || p.name + idx}
              style={{
                outline: highlight === idx ? '2px solid #2563EB' : '2px solid transparent',
                outlineOffset: 2,
                borderRadius: 10,
              }}
            >
              <PlaceResult place={p} onAdd={handleAdd} />
            </div>
          ))}
      </div>
    </div>
  );
}
