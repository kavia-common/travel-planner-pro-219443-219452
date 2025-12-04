import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useNotifications } from '../../../hooks/useNotifications';
import { getTrip, createTrip, updateTrip } from '../../../services/tripService';
import BasicsStep from './steps/BasicsStep';
import DatesStep from './steps/DatesStep';
import DestinationsStep from './steps/DestinationsStep';
import TravelersStep from './steps/TravelersStep';
import ReviewStep from './steps/ReviewStep';
import './wizard.css';

const initialState = {
  name: '',
  description: '',
  dates: { start: '', end: '' },
  destinations: [{ city: '', country: '', notes: '' }],
  travelers: [{ name: '', email: '' }],
};

const stepsConfig = [
  { key: 'basics', title: 'Basics' },
  { key: 'dates', title: 'Dates' },
  { key: 'destinations', title: 'Destinations' },
  { key: 'travelers', title: 'Travelers' },
  { key: 'review', title: 'Review & Save' },
];

function validateStep(stepIdx, data) {
  switch (stepsConfig[stepIdx].key) {
    case 'basics':
      return !!data.name?.trim();
    case 'dates': {
      const s = data.dates?.start;
      const e = data.dates?.end;
      if (!s || !e) return false;
      const sd = new Date(s);
      const ed = new Date(e);
      return !Number.isNaN(sd.getTime()) && !Number.isNaN(ed.getTime()) && ed.getTime() >= sd.getTime();
    }
    case 'destinations': {
      if (!Array.isArray(data.destinations) || data.destinations.length === 0) return false;
      return data.destinations.every(d => (d.city?.trim() || d.country?.trim()));
    }
    case 'travelers': {
      if (!Array.isArray(data.travelers) || data.travelers.length === 0) return false;
      return data.travelers.every(t => t.name?.trim());
    }
    case 'review':
      return true;
    default:
      return false;
  }
}

function useSessionDraft(key) {
  const load = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [key]);
  const save = useCallback((obj) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(obj));
    } catch {
      // ignore
    }
  }, [key]);
  const remove = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key]);
  return { load, save, remove };
}

// PUBLIC_INTERFACE
export default function TripWizard() {
  /** TripWizard - Multi-step create/edit wizard for trips.
   * - Create mode at /trips/new
   * - Edit mode at /trips/:id/edit
   * Persists drafts to sessionStorage and validates each step.
   */
  const navigate = useNavigate();
  const params = useParams();
  const id = params?.id;
  const isEdit = !!id;
  const draftKey = isEdit ? `trip-wizard-${id}` : 'trip-wizard';
  const { load, save, remove } = useSessionDraft(draftKey);
  const { notifyError, notifySuccess } = useNotifications();

  const [data, setData] = useState(initialState);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const stepContainerRef = useRef(null);

  // Load initial data (edit mode or draft)
  useEffect(() => {
    const draft = load();
    if (isEdit) {
      setLoading(true);
      (async () => {
        try {
          const apiData = await getTrip(id);
          const merged = {
            name: apiData?.name || '',
            description: apiData?.description || '',
            dates: {
              start: (apiData?.dates?.start || apiData?.startDate || '').slice(0, 10),
              end: (apiData?.dates?.end || apiData?.endDate || '').slice(0, 10),
            },
            destinations: (apiData?.destinations && apiData.destinations.length ? apiData.destinations : [{ city: '', country: '', notes: '' }]).map(d => ({
              city: d.city || '',
              country: d.country || '',
              notes: d.notes || '',
            })),
            travelers: (apiData?.travelers && apiData.travelers.length ? apiData.travelers : [{ name: '', email: '' }]).map(t => ({
              name: t.name || '',
              email: t.email || '',
            })),
          };
          const initial = draft ? { ...merged, ...draft } : merged;
          setData(initial);
        } catch (e) {
          notifyError('Failed to load trip data. You can still proceed with a new draft.');
          if (draft) setData(draft);
          else setData(initialState);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setData(draft || initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  // Persist draft on change
  useEffect(() => {
    save(data);
  }, [data, save]);

  // Focus management on step change
  useEffect(() => {
    if (stepContainerRef.current) {
      const focusable = stepContainerRef.current.querySelector('input, select, textarea, button');
      if (focusable) focusable.focus();
    }
  }, [step]);

  const onKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (validateStep(step, data)) {
        if (step < stepsConfig.length - 1) setStep(step + 1);
      }
    }
  }, [step, data]);

  const updateField = useCallback((patch) => {
    setData(prev => ({ ...prev, ...patch }));
  }, []);

  const nextDisabled = useMemo(() => !validateStep(step, data), [step, data]);

  const submit = useCallback(async () => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description || '',
        dates: {
          start: data.dates.start,
          end: data.dates.end,
        },
        destinations: data.destinations.map(d => ({ city: d.city, country: d.country, notes: d.notes || '' })),
        travelers: data.travelers.map(t => ({ name: t.name, email: t.email || '' })),
      };
      let result;
      if (isEdit) {
        result = await updateTrip(id, payload);
      } else {
        result = await createTrip(payload);
      }
      const tripId = result?.id || id;
      notifySuccess(isEdit ? 'Trip updated' : 'Trip created');
      remove();
      if (tripId) {
        navigate(`/trips/${tripId}`);
      } else {
        navigate('/trips');
      }
    } catch (e) {
      notifyError('Failed to save trip. Please correct any issues and try again.');
    } finally {
      setSubmitting(false);
    }
  }, [data, id, isEdit, navigate, notifyError, notifySuccess, remove]);

  const goTo = useCallback((idx) => {
    setStep(idx);
  }, []);

  const renderStep = () => {
    switch (stepsConfig[step].key) {
      case 'basics':
        return <BasicsStep value={{ name: data.name, description: data.description }} onChange={updateField} />;
      case 'dates':
        return <DatesStep value={data.dates} onChange={(v) => updateField({ dates: v })} />;
      case 'destinations':
        return <DestinationsStep value={data.destinations} onChange={(v) => updateField({ destinations: v })} />;
      case 'travelers':
        return <TravelersStep value={data.travelers} onChange={(v) => updateField({ travelers: v })} />;
      case 'review':
      default:
        return <ReviewStep value={data} onEditStep={goTo} />;
    }
  };

  return (
    <div className="twz-container" onKeyDown={onKeyDown}>
      <Card className="twz-card">
        <div className="twz-header">
          <div>
            <h2 className="twz-title">{isEdit ? 'Edit Trip' : 'Create a New Trip'}</h2>
            <p className="twz-subtitle">Follow the steps to {isEdit ? 'update your' : 'build your'} perfect itinerary</p>
          </div>
          <div className="twz-progress">
            {stepsConfig.map((s, idx) => (
              <button
                key={s.key}
                className={`twz-step ${idx === step ? 'active' : ''} ${idx < step ? 'done' : ''}`}
                onClick={() => goTo(idx)}
                aria-current={idx === step ? 'step' : undefined}
              >
                <span className="twz-step-index">{idx + 1}</span>
                <span className="twz-step-title">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="twz-body" ref={stepContainerRef} aria-live="polite">
          {loading ? <div className="twz-loading">Loading...</div> : renderStep()}
        </div>

        <div className="twz-footer">
          <Button variant="secondary" onClick={() => navigate(-1)} aria-label="Cancel and go back">
            Cancel
          </Button>
          <div className="twz-actions">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)} aria-label="Previous step">
                Back
              </Button>
            )}
            {step < stepsConfig.length - 1 && (
              <Button disabled={nextDisabled} onClick={() => setStep(step + 1)} aria-label="Next step">
                Next
              </Button>
            )}
            {step === stepsConfig.length - 1 && (
              <Button loading={submitting} onClick={submit} aria-label="Save trip">
                {isEdit ? 'Save Changes' : 'Create Trip'}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
