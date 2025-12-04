import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import featureFlags from '../flags/featureFlags';
import { runSearch } from '../services/searchService';
import SearchResultItem from '../components/search/SearchResultItem';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

// PUBLIC_INTERFACE
export default function SearchResults() {
  /** Full page search results with filter chips and pagination. */
  const q = useQuery();
  const navigate = useNavigate();
  const [query, setQuery] = useState(q.get('q') || '');
  const [active, setActive] = useState('all'); // all, trips, itinerary, packing, budget
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ all: [], trips: [], itinerary: [], packing: [], budget: [], places: [] });
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const currentQ = q.get('q') || '';
    setQuery(currentQ);
  }, [q]);

  useEffect(() => {
    let ignore = false;
    async function go() {
      if (!featureFlags.GLOBAL_SEARCH) return;
      if (!query) {
        setResults({ all: [], trips: [], itinerary: [], packing: [], budget: [], places: [] });
        return;
      }
      setLoading(true);
      const r = await runSearch(query);
      if (!ignore && r) {
        setResults(r);
      }
      setLoading(false);
    }
    go();
    return () => {
      ignore = true;
    };
  }, [query]);

  const data = useMemo(() => {
    switch (active) {
      case 'trips': return results.trips || [];
      case 'itinerary': return results.itinerary || [];
      case 'packing': return results.packing || [];
      case 'budget': return results.budget || [];
      default: return results.all || [];
    }
  }, [active, results]);

  const totalPages = Math.max(1, Math.ceil((data.length || 0) / perPage));
  const paged = data.slice((page - 1) * perPage, page * perPage);

  useEffect(() => setPage(1), [active, query]);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex gap-2 items-center">
          <input
            value={query}
            onChange={(e) => {
              const nq = e.target.value;
              setQuery(nq);
              const url = `/search?q=${encodeURIComponent(nq)}`;
              navigate(url, { replace: true });
            }}
            placeholder="Search across trips, itinerary, packing, and budget..."
            className="flex-1 outline-none bg-white rounded-lg border border-gray-200 px-3 py-2 focus:border-blue-500 transition"
          />
          <div className="flex gap-2">
            {['all', 'trips', 'itinerary', 'packing', 'budget'].map((k) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={
                  'text-xs px-3 py-2 rounded-full border transition ' +
                  (active === k
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300')
                }
              >
                {k[0].toUpperCase() + k.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {loading ? (
          <div className="text-gray-500 text-sm">Searching...</div>
        ) : !query ? (
          <div className="text-gray-500 text-sm">Enter a query to view results.</div>
        ) : paged.length === 0 ? (
          <div className="text-gray-500 text-sm">No results.</div>
        ) : (
          <div className="grid gap-2">
            {paged.map((item, idx) => (
              <SearchResultItem key={`${item.__type}-${item.id || idx}`} item={item} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <div className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </div>
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
