import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ItineraryView from '../components/itinerary/ItineraryView';
import ItineraryForm from '../components/itinerary/ItineraryForm';
import { useItinerary } from '../hooks/useItinerary';
import { useTrips } from '../hooks/useTrips';
import { useToast } from '../components/common/Toast';

import useBudget from '../hooks/useBudget';
import BudgetSummary from '../components/budget/BudgetSummary';
import ExpenseList from '../components/budget/ExpenseList';
import ExpenseForm from '../components/budget/ExpenseForm';
import BudgetChart from '../components/budget/BudgetChart';
import { isEnabled as isFeatureEnabled, isEnabled } from '../flags/featureFlags';
const CalendarItineraryLazy = React.lazy(() => import('../components/itinerary/CalendarItinerary'));
const PackingListLazy = React.lazy(() => import('../components/packing/PackingList'));

/**
 * PUBLIC_INTERFACE
 * TripDetails page: displays details for a specific trip with itinerary listing and optional Budget Planner tab (FEATURE_BUDGET).
 */
export default function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Itinerary integration (existing behavior)
  const { items, loading, error, loadItinerary, addItem, updateItem, removeItem } = useItinerary(tripId);
  const { getTrip, selectTrip } = useTrips();
  const { success, error: errorToast, info } = useToast();

  // Local state for itinerary modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const describedId = useMemo(() => 'itin-modal-desc', []);

  // Feature flag and budget integration
  const budgetEnabled = isFeatureEnabled('FEATURE_BUDGET');
  const wizardEnabled = isEnabled('TRIP_WIZARD');
  const [toasts, setToasts] = useState([]);
  const pushToast = (t) => setToasts((prev) => [...prev, { id: Date.now() + Math.random(), ...t }]);
  const budget = useBudget(tripId, { onToast: pushToast });
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const calendarEnabled = isFeatureEnabled('ITINERARY_CALENDAR');
  const packingEnabled = isFeatureEnabled('PACKING_LIST');
  const tabNames = useMemo(() => {
    const base = ['Itinerary'];
    if (calendarEnabled) base.push('Calendar');
    if (budgetEnabled) base.push('Budget');
    if (packingEnabled) base.push('Packing');
    return base;
  }, [budgetEnabled, calendarEnabled, packingEnabled]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    // Initial load for itinerary and trip selection
    selectTrip(tripId);
    getTrip(tripId).catch(() => {});
    loadItinerary().catch(() => {
      errorToast('Failed to load itinerary');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  useEffect(() => {
    // Ensure activeTab stays within available tabs after flag changes
    const maxIndex = tabNames.length - 1;
    if (activeTab > maxIndex) setActiveTab(0);
  }, [tabNames, activeTab]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      if (editing?.id) {
        await updateItem(editing.id, payload);
        success('Itinerary updated');
      } else {
        await addItem(payload);
        success('Itinerary item added');
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      errorToast('Unable to save itinerary item');
      loadItinerary().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(it) {
    if (!it) return;
    const ok = window.confirm(`Remove itinerary item "${it.title || it.name || it.id}"?`);
    if (!ok) return;
    try {
      await removeItem(it.id);
      info('Item removed');
    } catch (e) {
      errorToast('Failed to remove item');
      loadItinerary().catch(() => {});
    }
  }

  // Budget handlers
  const onAddExpenseClick = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const onEditExpense = (item) => {
    setEditingExpense(item);
    setExpenseModalOpen(true);
  };

  const onSubmitExpense = async (payload) => {
    try {
      if (editingExpense?.id) {
        await budget.editExpense(editingExpense.id, payload);
      } else {
        await budget.addExpense(payload);
      }
      setExpenseModalOpen(false);
    } catch {
      // hook toasts already show error
    }
  };

  const handleDeleteExpense = async (item) => {
    try {
      await budget.removeExpense(item.id);
    } catch {
      // hook toasts already show error
    }
  };

  const handleEditBudget = async () => {
    const next = window.prompt('Enter new budget target amount', String(budget.totals?.target ?? 0));
    if (next == null) return;
    const num = Number(next);
    if (Number.isNaN(num) || num < 0) {
      pushToast({ type: 'error', message: 'Please enter a valid non-negative number' });
      return;
    }
    try {
      await budget.setBudgetTarget(num);
    } catch {
      // hook toast
    }
  };

  return (
    <>
      <Card
        title="Trip Details"
        subtitle={`Trip ID: ${tripId}`}
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            {activeTab === 0 ? (
              <Button variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>Add Itinerary Item</Button>
            ) : budgetEnabled && tabNames[activeTab] === 'Budget' ? (
              <Button variant="primary" onClick={onAddExpenseClick}>Add Expense</Button>
            ) : null}
            {wizardEnabled && (
              <Button variant="ghost" onClick={() => navigate(`/trips/${tripId}/edit`)}>Edit Trip</Button>
            )}
          </div>
        }
      >
        {/* Tabs */}
        <div role="tablist" aria-label="Trip sections" style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {tabNames.map((name, idx) => (
            <button
              key={name}
              role="tab"
              aria-selected={activeTab === idx}
              aria-controls={`panel-${idx}`}
              id={`tab-${idx}`}
              onClick={() => setActiveTab(idx)}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: activeTab === idx ? '2px solid var(--primary, #2563EB)' : '1px solid rgba(17,24,39,0.12)',
                background: activeTab === idx ? 'var(--surface)' : 'var(--background)',
                cursor: 'pointer',
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <React.Suspense fallback={<div className="text-muted">Loading view…</div>}>
        {/* Itinerary Panel */}
        {activeTab === 0 && (
          <div role="tabpanel" id="panel-0" aria-labelledby="tab-0">
            {loading && <div className="text-muted" aria-live="polite">Loading itinerary…</div>}
            {!!error && (
              <div className="text-muted" role="alert" style={{ color: 'var(--color-error)' }}>
                Failed to load itinerary. Please try again.
              </div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="text-muted" aria-live="polite">No itinerary items yet. Add your first activity.</div>
            )}
            {!loading && !error && items.length > 0 && (
              <ItineraryView
                items={items}
                onEdit={(it) => { setEditing(it); setOpen(true); }}
                onRemove={handleRemove}
              />
            )}
          </div>
        )}

        {/* Calendar Panel */}
        {calendarEnabled && activeTab === (budgetEnabled ? 1 : 1) && (
          <div role="tabpanel" id={`panel-${budgetEnabled ? 1 : 1}`} aria-labelledby={`tab-${budgetEnabled ? 1 : 1}`}>
            <div style={{ overflowX: 'auto' }}>
              {/* Lazy import to avoid adding dnd-kit to main bundle until needed */}
              <CalendarItineraryLazy tripId={tripId} />
            </div>
          </div>
        )}

        {/* Budget Panel */}
        {budgetEnabled && activeTab === (calendarEnabled ? 2 : 1) && (
          <div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
            <div style={{ display: 'grid', gap: 12 }}>
              <BudgetSummary totals={budget.totals} onEditBudget={handleEditBudget} />
              <div style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid rgba(17,24,39,0.08)', padding: 12 }}>
                {budget.loading ? (
                  <p>Loading budget...</p>
                ) : budget.error ? (
                  <p role="alert" style={{ color: '#EF4444' }}>Failed to load budget data.</p>
                ) : (
                  <>
                    <ExpenseList items={budget.expenses} onEdit={onEditExpense} onDelete={handleDeleteExpense} />
                    <div style={{ marginTop: 12 }}>
                      <BudgetChart breakdown={budget.totals?.breakdown || []} currency={budget.totals?.currency} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <ExpenseForm
              open={expenseModalOpen}
              onClose={() => setExpenseModalOpen(false)}
              onSubmit={onSubmitExpense}
              initialValue={editingExpense}
            />
          </div>
        )}

        {/* Packing Panel */}
        {packingEnabled && activeTab === (calendarEnabled && budgetEnabled ? 3 : (calendarEnabled || budgetEnabled ? 2 : 1)) && (
          <div role="tabpanel" id="panel-packing" aria-labelledby={`tab-${activeTab}`}>
            <PackingListLazy tripId={tripId} />
          </div>
        )}
        </React.Suspense>
      </Card>

      {/* Existing itinerary modal */}
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

      {/* Toast region (if using common Toast hook, we already use useToast; this region supports hook toasts inside useBudget) */}
      <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 50 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#FEE2E2' : '#ECFDF5',
            border: `1px solid ${t.type === 'error' ? '#EF4444' : '#10B981'}`,
            color: 'var(--text)',
            borderRadius: 8,
            padding: '8px 12px',
            marginTop: 8,
            minWidth: 220,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
          }}>
            {t.message}
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              aria-label="Close notification"
              style={{ float: 'right', background: 'transparent', border: 'none', cursor: 'pointer', color: '#374151' }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
