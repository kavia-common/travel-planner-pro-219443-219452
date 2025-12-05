import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import TripList from '../components/trips/TripList';
import TripForm from '../components/trips/TripForm';
import { useTrips } from '../hooks/useTrips';
import { useToast } from '../components/common/Toast';
import { isEnabled } from '../flags/featureFlags';
import TemplatePicker from '../features/templates/TemplatePicker';
import TripPreview from '../features/templates/TripPreview';
import { useStore, actionCreators } from '../state/store';

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
  const [showTemplateFlow, setShowTemplateFlow] = useState(false);
  const [selectedTemplateDraft, setSelectedTemplateDraft] = useState(null);

  const navigate = useNavigate();
  const wizardEnabled = isEnabled('TRIP_WIZARD');
  const templatesEnabled = isEnabled('TEMPLATES');
  const { state, dispatch } = useStore();

  useEffect(() => {
    loadTrips().catch(() => {
      errorToast('Failed to load trips');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If there is a draft from a previous template selection in global state, hydrate local state
  useEffect(() => {
    if (state?.draftTemplateTrip && !selectedTemplateDraft) {
      setSelectedTemplateDraft(state.draftTemplateTrip);
      setShowTemplateFlow(true);
      setOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.draftTemplateTrip]);

  const modalTitle = useMemo(() => {
    if (editing) return 'Edit Trip';
    if (showTemplateFlow && selectedTemplateDraft) {
      return `Create Trip from "${selectedTemplateDraft.templateName || selectedTemplateDraft.name}"`;
    }
    return 'Create Trip';
  }, [editing, showTemplateFlow, selectedTemplateDraft]);

  const describedId = useMemo(() => 'trip-modal-desc', []);

  function buildDraftFromTemplate(template) {
    if (!template) return null;
    const today = new Date();
    const start = today.toISOString().slice(0, 10);
    const endDate = new Date(today);
    const duration = template.recommendedDurationDays || (template.days?.length || 1);
    endDate.setDate(endDate.getDate() + Math.max(1, duration - 1));
    const end = endDate.toISOString().slice(0, 10);

    const draft = {
      name: template.name,
      title: template.name,
      description: template.description,
      startDate: start,
      endDate: end,
      templateId: template.id,
      templateName: template.name,
      days: (template.days || []).map((d) => ({
        dayIndex: d.dayIndex,
        title: d.title,
        notes: d.notes,
        activities: (d.activities || []).map((a) => ({
          time: a.time,
          title: a.title,
          category: a.category,
          durationMins: a.durationMins,
        })),
      })),
    };

    dispatch(actionCreators.setDraftTemplateTrip(draft));
    return draft;
  }

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
      dispatch(actionCreators.clearDraftTemplateTrip());
      setSelectedTemplateDraft(null);
      setShowTemplateFlow(false);
      setOpen(false);
      setEditing(null);
    } catch (e) {
      errorToast('Unable to save trip');
    } finally {
      setSubmitting(false);
    }
  }

  function handleStartFromTemplateClick() {
    if (!templatesEnabled) return;
    setShowTemplateFlow(true);
    setOpen(true);
    setEditing(null);
  }

  function handleTemplateSelected(template) {
    const draft = buildDraftFromTemplate(template);
    setSelectedTemplateDraft(draft);
  }

  async function handleDelete(trip) {
    if (!trip) return;
    const ok = window.confirm(`Remove trip "${trip.name || trip.title || trip.id}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await removeTrip(trip.id);
      info('Trip removed');
    } catch (e) {
      errorToast('Failed to remove trip');
    }
  }

  function handleCloseModal() {
    if (submitting) return;
    setOpen(false);
    setEditing(null);
    setShowTemplateFlow(false);
    setSelectedTemplateDraft(null);
    dispatch(actionCreators.clearDraftTemplateTrip());
  }

  return (
    <>
      <Card
        title="My Trips"
        subtitle="All your journeys in one place"
        footer={
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {wizardEnabled ? (
              <Button variant="primary" onClick={() => navigate('/trips/new')}>
                New Trip
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditing(null);
                    setShowTemplateFlow(false);
                    setSelectedTemplateDraft(null);
                    dispatch(actionCreators.clearDraftTemplateTrip());
                    setOpen(true);
                  }}
                >
                  Blank Trip
                </Button>
                {templatesEnabled && (
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={handleStartFromTemplateClick}
                  >
                    Choose a Template
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost">Import</Button>
          </div>
        }
      >
        {loading && (
          <div className="text-muted" aria-live="polite">
            Loading trips…
          </div>
        )}
        {!!error && (
          <div
            className="text-muted"
            role="alert"
            style={{ color: 'var(--color-error)' }}
          >
            Failed to load trips. Please try again.
          </div>
        )}
        {!loading && !error && trips.length === 0 && (
          <div
            className="text-muted"
            aria-live="polite"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <img
              src="/assets/empty-travel.png"
              alt=""
              aria-hidden
              style={{ width: 28, height: 28, opacity: 0.9 }}
            />
            No trips yet. Use the{' '}
            {wizardEnabled
              ? 'New Trip'
              : templatesEnabled
              ? 'Blank Trip or Choose a Template'
              : 'Blank Trip'}{' '}
            action to add your first itinerary.
          </div>
        )}
        {!loading && !error && trips.length > 0 && (
          <TripList
            trips={trips}
            onView={(t) => navigate(`/trips/${t.id}`)}
            onEdit={(t) => {
              setEditing(t);
              setShowTemplateFlow(false);
              setSelectedTemplateDraft(null);
              dispatch(actionCreators.clearDraftTemplateTrip());
              setOpen(true);
            }}
            onDelete={handleDelete}
          />
        )}
      </Card>

      <Modal
        open={open}
        onClose={handleCloseModal}
        title={modalTitle}
        ariaDescribedBy={describedId}
        ariaLabelledBy="trip-modal-title"
      >
        <div id={describedId} className="text-muted" style={{ marginBottom: 8 }}>
          {editing
            ? 'Update details of your trip.'
            : showTemplateFlow
            ? 'Pick a template to pre-fill your trip, then review and adjust details.'
            : 'Enter details to create a new trip.'}
        </div>

        {showTemplateFlow && templatesEnabled ? (
          <>
            <TemplatePicker onSelect={handleTemplateSelected} />
            {selectedTemplateDraft && (
              <TripPreview
                trip={{
                  name: selectedTemplateDraft.name,
                  startDate: selectedTemplateDraft.startDate,
                  endDate: selectedTemplateDraft.endDate,
                  templateId: selectedTemplateDraft.templateId,
                  days: selectedTemplateDraft.days,
                }}
              />
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
                marginTop: 16,
              }}
            >
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowTemplateFlow(false);
                  setSelectedTemplateDraft(null);
                  dispatch(actionCreators.clearDraftTemplateTrip());
                }}
              >
                Back to blank trip
              </Button>
            </div>
            <hr
              style={{
                margin: '16px 0',
                border: 'none',
                borderTop: '1px solid rgba(15,23,42,0.06)',
              }}
            />
            <TripForm
              initial={selectedTemplateDraft || editing}
              onSubmit={handleSubmit}
              onCancel={handleCloseModal}
              submitting={submitting}
            />
          </>
        ) : (
          <TripForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            submitting={submitting}
          />
        )}
      </Modal>
    </>
  );
}
