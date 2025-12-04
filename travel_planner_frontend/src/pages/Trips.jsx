import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TripList from '../components/trips/TripList';
import TripForm from '../components/trips/TripForm';
import { useTrips } from '../hooks/useTrips';
import { useToast } from '../components/common/Toast';

/**
 * PUBLIC_INTERFACE
 * Trips page: shows user's trips and management options.
 */
export default function Trips() {
  const { trips, loading, error, loadTrips, createTrip, updateTrip, removeTrip } = useTrips();
  const { success, error: errorToast, info } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTrips().catch((e) => {
      errorToast('Failed to load trips');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const modalTitle = editing ? 'Edit Trip' : 'Create Trip';
  const describedId = useMemo(() => 'trip-modal-desc', []);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateTrip(editing.id, payload);
        success('Trip updated');
      } else {
        await createTrip(payload);
        success('Trip created');
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      errorToast('Unable to save trip');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(trip) {
    if (!trip) return;
    // Confirmation dialog
    const ok = window.confirm(`Remove trip "${trip.name || trip.title || trip.id}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await removeTrip(trip.id);
      info('Trip removed');
    } catch (e) {
      errorToast('Failed to remove trip');
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
          <div className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/empty-travel.png" alt="" aria-hidden style={{ width: 28, height: 28, opacity: 0.9 }} />
            No trips yet. Use the Create Trip action to add your first itinerary.
          </div>
        )}
        {!loading && !error && trips.length > 0 && (
          <TripList
            trips={trips}
            onView={(t) => {}}
            onEdit={(t) => { setEditing(t); setOpen(true); }}
            onDelete={handleDelete}
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
