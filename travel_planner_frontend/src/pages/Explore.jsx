import React, { useEffect, useMemo, useRef, useState } from 'react';
import useExplore from '../hooks/useExplore';
import SearchBar from '../components/explore/SearchBar';
import FilterPanel from '../components/explore/FilterPanel';
import DestinationCard from '../components/explore/DestinationCard';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Card from '../components/common/Card';
import '../styles/util.css';
import '../styles/theme.css';

export default function Explore() {
  const {
    query, setQuery,
    filters, setFilters,
    items, loading, error, hasMore,
    loadMore, addDestinationToTrip, trips, selectDestination,
  } = useExplore();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [newTripName, setNewTripName] = useState('');

  // Infinite scroll using intersection observer
  const sentinelRef = useRef(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const openAddToTrip = (destination) => {
    setSelectedDestination(destination);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setSelectedTripId('');
    setNewTripName('');
  };
  const onConfirmAdd = async () => {
    const ok = await addDestinationToTrip({
      destination: selectedDestination,
      tripId: selectedTripId || undefined,
      createNewTripName: (!selectedTripId && newTripName) ? newTripName : undefined,
    });
    if (ok) closeModal();
  };

  const header = useMemo(() => (
    <div style={{ marginBottom: '0.75rem' }}>
      <h1 style={{ margin: '0 0 0.25rem', color: 'var(--color-text, #111827)' }}>Explore</h1>
      <p style={{ margin: 0, color: '#374151' }}>Search destinations and add them to your trips.</p>
    </div>
  ), []);

  return (
    <div className="container" role="main" aria-label="Explore destinations">
      {header}
      <Card>
        <SearchBar value={query} onChange={setQuery} />
        <FilterPanel filters={filters} onChange={setFilters} />
      </Card>

      {loading && items.length === 0 ? (
        <div className="explore-loading" role="status" aria-live="polite">Loading destinations...</div>
      ) : null}

      {error && items.length === 0 ? (
        <div className="explore-error" role="alert">Unable to load explore results.</div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <div className="explore-empty">No destinations found. Try adjusting your search or filters.</div>
      ) : null}

      <div className="explore-grid" style={{ marginTop: '1rem' }}>
        {items.map((d) => (
          <DestinationCard
            key={d.id || d.name}
            destination={d}
            onAddToTrip={openAddToTrip}
            onViewDetails={(dest) => selectDestination(dest?.id)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="explore-loadmore">
          <Button onClick={loadMore} aria-label="Load more destinations" variant="secondary">Load More</Button>
        </div>
      )}
      <div ref={sentinelRef} aria-hidden="true" />

      <Modal isOpen={modalOpen} onClose={closeModal} ariaLabel="Add destination to trip">
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <h2 style={{ margin: 0 }}>Add to Trip</h2>
          <p style={{ margin: 0, color: '#374151' }}>
            Choose an existing trip or create a new one to add
            {selectedDestination?.name ? ` "${selectedDestination.name}"` : ' this destination'}.
          </p>

          {trips?.length ? (
            <label>
              <span className="sr-only">Select trip</span>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                aria-label="Select existing trip"
                className="explore-input"
              >
                <option value="">Select a trip</option>
                {trips.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>
          ) : null}

          <div>
            <label htmlFor="new-trip-name">Or create new trip</label>
            <input
              id="new-trip-name"
              type="text"
              value={newTripName}
              onChange={(e) => setNewTripName(e.target.value)}
              placeholder="New trip name"
              className="explore-input"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button
              variant="primary"
              onClick={onConfirmAdd}
              disabled={!selectedTripId && !newTripName}
            >
              Add
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
