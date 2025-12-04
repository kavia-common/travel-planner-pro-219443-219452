import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ItineraryView from '../components/itinerary/ItineraryView';
import ItineraryForm from '../components/itinerary/ItineraryForm';
import { useItinerary } from '../hooks/useItinerary';
import { useTrips } from '../hooks/useTrips';

/**
 * PUBLIC_INTERFACE
 * TripDetails page: displays details for a specific trip with itinerary listing.
 */
export default function TripDetails() {
  const { tripId } = useParams();
  const { items, loading, error, loadItinerary, addItem, updateItem, removeItem } = useItinerary(tripId);
  const { getTrip, selectTrip } = useTrips();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const describedId = useMemo(() => 'itin-modal-desc', []);

  useEffect(() => {
    selectTrip(tripId);
    // try to hydrate trip info into store (no-op if fails)
    getTrip(tripId).catch(() => {});
    loadItinerary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateItem(editing.id, payload);
      } else {
        await addItem(payload);
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
        title="Trip Details"
        subtitle={`Trip ID: ${tripId}`}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>Add Itinerary Item</Button>
          </div>
        }
      >
        {loading && <div className="text-muted">Loading itinerary…</div>}
        {error && (
          <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
            Failed to load itinerary.
          </div>
        )}
        {!loading && !error && items.length === 0 && (
          <div className="text-muted">No itinerary items yet. Add your first activity.</div>
        )}
        {!loading && !error && items.length > 0 && (
          <ItineraryView
            items={items}
            onEdit={(it) => { setEditing(it); setOpen(true); }}
            onRemove={(it) => { removeItem(it.id).catch(() => {}); }}
          />
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => { if (!submitting) { setOpen(false); setEditing(null); } }}
        title={editing ? 'Edit Itinerary Item' : 'Add Itinerary Item'}
        ariaDescribedBy={describedId}
        ariaLabelledBy="itinerary-modal-title"
      >
        <div id={describedId} className="text-muted" style={{ marginBottom: 8 }}>
          {editing ? 'Update details of your itinerary item.' : 'Enter details for the new itinerary item.'}
        </div>
        <ItineraryForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => { if (!submitting) { setOpen(false); setEditing(null); } }}
          submitting={submitting}
        />
      </Modal>
    </>
  );
}
