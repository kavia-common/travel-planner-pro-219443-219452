import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TripList from '../components/trips/TripList';
import TripForm from '../components/trips/TripForm';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * Trips page: shows user's trips and management options.
 */
export default function Trips() {
  const { trips, loading, error, loadTrips, createTrip, updateTrip, removeTrip } = useTrips();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTrips().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modalTitle = editing ? 'Edit Trip' : 'Create Trip';
  const describedId = useMemo(() => 'trip-modal-desc', []);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateTrip(editing.id, payload);
      } else {
        await createTrip(payload);
      }
      setOpen(false);
      setEditing(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Card
        title="My Trips"
        subtitle="All your journeys in one place"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>Create Trip</Button>
            <Button variant="ghost">Import</Button>
          </div>
        }
      >
        {loading && <div className="text-muted">Loading trips…</div>}
        {error && (
          <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
            Failed to load trips.
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div className="text-muted">No trips yet. Use the Create Trip action to add your first itinerary.</div>
        )}
        {!loading && !error && trips.length > 0 && (
          <TripList
            trips={trips}
            onView={(t) => {}}
            onEdit={(t) => { setEditing(t); setOpen(true); }}
            onDelete={(t) => { removeTrip(t.id).catch(() => {}); }}
          />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => { if (!submitting) { setOpen(false); setEditing(null); } }}
        title={modalTitle}
        ariaDescribedBy={describedId}
        ariaLabelledBy="trip-modal-title"
      >
        <div id={describedId} className="text-muted" style={{ marginBottom: 8 }}>
          {editing ? 'Update details of your trip.' : 'Enter details to create a new trip.'}
        </div>
        <TripForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { if (!submitting) { setOpen(false); setEditing(null); } }}
          submitting={submitting}
        />
      </Modal>
    </>
  );
}
