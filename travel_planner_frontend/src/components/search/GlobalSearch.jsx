import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import featureFlags from '../../flags/featureFlags';
import { debouncedSearch, cancelActiveSearch } from '../../services/searchService';
import '../../styles/theme.css';
import '../../theme/ocean.css';

// PUBLIC_INTERFACE
export default function GlobalSearch({ isOpen, onClose }) {
  /** Command-palette style global search modal with grouped results and keyboard navigation. */
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState({ trips: [], itinerary: [], places: [], packing: [], budget: [] });
  const [flat, setFlat] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const visible = isOpen && featureFlags.GLOBAL_SEARCH;

  const all = useMemo(() => flat, [flat]);

  const run = useCallback(
    async (q) => {
      setLoading(true);
      const res = await debouncedSearch(q, { delay: 300 });
      if (!res) {
        setLoading(false);
        return;
      }
      setGroups({
        trips: res.trips || [],
        itinerary: res.itinerary || [],
        places: res.places || [],
        packing: res.packing || [],
        budget: res.budget || [],
      });
      setFlat(res.all || []);
      setActiveIdx(0);
      setLoading(false);
    },
    [setGroups, setFlat]
  );

  useEffect(() => {
    if (visible) {
      setQuery('');
      setGroups({ trips: [], itinerary: [], places: [], packing: [], budget: [] });
      setFlat([]);
      setActiveIdx(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      cancelActiveSearch();
    }
  }, [visible]);

  useEffect(() => {
    if (!query) {
      setGroups({ trips: [], itinerary: [], places: [], packing: [], budget: [] });
      setFlat([]);
      setActiveIdx(0);
      setLoading(false);
      return;
    }
    run(query);
  }, [query, run]);

  const onKeyDown = (e) => {
    if (!visible) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, Math.max(0, all.length - 1)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = all[activeIdx];
      if (item) {
        navigate(item.url || '/');
        onClose?.();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    }
  };

  useEffect(() => {
    if (!visible) return;
    const handler = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === '/') {
        // Allow focusing the search
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [visible]);

  if (!visible) return null;

  const groupsToRender = [
    { key: 'trips', title: 'Trips', icon: '🧳', items: groups.trips },
    { key: 'itinerary', title: 'Itinerary', icon: '📅', items: groups.itinerary },
    { key: 'packing', title: 'Packing', icon: '✅', items: groups.packing },
    { key: 'budget', title: 'Budget', icon: '💰', items: groups.budget },
    { key: 'places', title: 'Places', icon: '📍', items: groups.places },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/30 flex items-start justify-center p-4"
      onKeyDown={onKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden transition-all">
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trips, itinerary, packing, budget... (Press / or Cmd/Ctrl+K)"
            className="w-full outline-none bg-white rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 transition"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto" ref={listRef}>
          {!query && (
            <div className="p-6 text-gray-500 text-sm">Start typing to search your travel planner.</div>
          )}
          {loading && (
            <div className="p-6 text-gray-500 text-sm animate-pulse">Searching...</div>
          )}
          {!loading && query && all.length === 0 && (
            <div className="p-6 text-gray-500 text-sm">No results found.</div>
          )}

          {groupsToRender.map((g) =>
            (g.items || []).length ? (
              <div key={g.key} className="px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-2 flex items-center gap-2">
                  <span>{g.icon}</span>
                  <span>{g.title}</span>
                </div>
                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
                  {g.items.map((item, idxGlobal) => {
                    const idx = all.findIndex((x) => x === item);
                    const isActive = idx === activeIdx;
                    return (
                      <li
                        key={`${g.key}-${item.id || item.primary}-${idx}`}
                        className={
                          'cursor-pointer px-3 py-2 text-sm flex items-center justify-between ' +
                          (isActive
                            ? 'bg-blue-50 text-blue-900'
                            : 'hover:bg-gray-50 text-gray-800')
                        }
                        onMouseEnter={() => setActiveIdx(idx)}
                        onClick={() => {
                          navigate(item.url || '/');
                          onClose?.();
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="opacity-70">{g.icon}</span>
                          <div>
                            <div className="font-medium">{item.primary}</div>
                            {item.secondary ? (
                              <div className="text-gray-500 text-xs">{item.secondary}</div>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {g.title.slice(0, 1)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
          <div>Use ↑ ↓ to navigate, Enter to open, Esc to close</div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition px-2 py-1 rounded hover:bg-gray-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
