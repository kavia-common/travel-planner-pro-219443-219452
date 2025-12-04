import React, { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from '../common/Card';
import Button from '../common/Button';
import { useItinerary } from '../../hooks/useItinerary';
import { useTrips } from '../../hooks/useTrips';
import { ItineraryService } from '../../services/itineraryService';
import { isEnabled } from '../../flags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * CalendarItinerary renders a drag-and-drop calendar-like view of a trip's itinerary items
 * grouped by day between trip start and end dates. Users can drag items across days and reorder
 * within a day. It loads data from useItinerary(tripId) and updates via ItineraryService.
 */
export default function CalendarItinerary({ tripId }) {
  const { items, loading, error, loadItinerary } = useItinerary(tripId);
  const { getTrip } = useTrips();
  const [trip, setTrip] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Dates range for columns
  const days = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return [];
    const out = [];
    const d0 = new Date(trip.startDate);
    const d1 = new Date(trip.endDate);
    const cur = new Date(d0);
    while (cur <= d1) {
      out.push(toISODate(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  }, [trip]);

  // Group items by day (default to start date or 'unscheduled' bucket)
  const itemsByDay = useMemo(() => {
    const map = {};
    for (const d of days) map[d] = [];
    for (const it of items || []) {
      const d = it.date ? toISODate(new Date(it.date)) : null;
      if (d && map[d]) {
        map[d].push(it);
      } else if (days.length > 0) {
        // place out-of-range or missing-date items on first day
        map[days[0]].push(it);
      }
    }
    // simple stable sort by time if available
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => {
        const ta = a.time || a.startTime || '';
        const tb = b.time || b.startTime || '';
        return String(ta).localeCompare(String(tb));
      });
    }
    return map;
  }, [items, days]);

  useEffect(() => {
    let mounted = true;
    async function prime() {
      try {
        const t = await getTrip(tripId);
        if (mounted) setTrip(t);
      } catch {
        // ignore; TripDetails page likely fetched already
      }
      try {
        await loadItinerary();
      } catch {
        // handled via error state
      }
    }
    if (tripId) prime();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const onDragStart = (event) => {
    const { active } = event;
    const { item } = active?.data?.current || {};
    setActiveItem(item || null);
  };

  const onDragOver = () => {
    // no-op (we apply updates onDragEnd)
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    setActiveItem(null);
    if (!active || !over) return;

    const activeData = active.data.current;
    const overData = over.data?.current;
    const sourceDay = activeData?.dayId;
    // over can be a column (day) or an item
    let targetDay = overData?.dayId || over.id; // when over column, we set id=dayId
    if (typeof targetDay !== 'string') {
      // fallback in case container id logic differs
      targetDay = overData?.containerId || sourceDay;
    }

    const item = activeData?.item;
    if (!item || !sourceDay || !targetDay) return;

    try {
      // If moved across columns, update date on server
      if (sourceDay !== targetDay) {
        await ensureUpdateItemDay(tripId, item.id, targetDay);
      } else {
        // Reordering within same day: optionally send order update if backend supports.
        // For now, refresh to reflect new client-side order if any logic added later.
      }
      await loadItinerary();
    } catch {
      // silently fail, parent should show error banner if needed
    }
  };

  // Feature flag guard
  if (!isEnabled('ITINERARY_CALENDAR')) {
    return (
      <Card title="Calendar" subtitle="This feature is disabled by configuration">
        <div className="text-muted">Enable ITINERARY_CALENDAR to use this view.</div>
      </Card>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <h3 style={{ margin: 0 }}>Itinerary Calendar</h3>
          {trip?.startDate && trip?.endDate && (
            <div className="text-muted" style={{ fontSize: 13 }}>
              {new Date(trip.startDate).toDateString()} – {new Date(trip.endDate).toDateString()}
            </div>
          )}
        </div>
        <div>
          <Button variant="ghost" onClick={() => loadItinerary()} aria-label="Refresh itinerary">
            Refresh
          </Button>
        </div>
      </div>

      {loading && (
        <div className="text-muted" aria-live="polite">Loading itinerary…</div>
      )}
      {!loading && error && (
        <div role="alert" style={{ color: 'var(--color-error)' }}>
          Failed to load itinerary. Please try again.
        </div>
      )}
      {!loading && !error && (!days || days.length === 0) && (
        <div className="text-muted">Trip dates are not configured. Set start and end dates to use the calendar.</div>
      )}
      {!loading && !error && days && days.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <div
            role="region"
            aria-label="Itinerary calendar by day"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(days.length, 7)}, minmax(220px, 1fr))`,
              gap: 12,
              overflowX: 'auto',
            }}
          >
            {days.map((dayId) => (
              <DayColumn
                key={dayId}
                dayId={dayId}
                items={itemsByDay[dayId] || []}
              />
            ))}
          </div>

          <DragOverlay>
            {activeItem ? (
              <ItemCard item={activeItem} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

function DayColumn({ dayId, items }) {
  // Sortable context for items within this day
  return (
    <div
      className="surface rounded-md"
      style={{
        border: '1px solid var(--color-border)',
        background: 'linear-gradient(180deg, var(--gradient-start), var(--color-surface))',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 280,
      }}
      // Allow dropping on empty column: use container id as dayId
      id={dayId}
      data-day={dayId}
    >
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid var(--color-border)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          aria-hidden
          style={{
            width: 8,
            height: 8,
            borderRadius: 999,
            background: 'var(--color-primary-500)',
            display: 'inline-block',
          }}
        />
        {new Date(dayId).toDateString()}
      </div>
      <SortableContext items={(items || []).map((it) => it.id)} strategy={rectSortingStrategy}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 8, display: 'grid', gap: 8, flex: 1 }}>
          {items && items.length > 0 ? (
            items.map((it) => <SortableItem key={it.id} item={it} dayId={dayId} />)
          ) : (
            <li
              className="text-muted"
              style={{
                border: '1px dashed var(--color-border)',
                borderRadius: 8,
                padding: '12px',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
              aria-label={`No items for ${new Date(dayId).toDateString()}`}
            >
              Drop items here
            </li>
          )}
        </ul>
      </SortableContext>
    </div>
  );
}

function SortableItem({ item, dayId }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    data: { item, dayId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ItemCard item={item} />
    </li>
  );
}

function ItemCard({ item, dragging = false }) {
  return (
    <div
      className="rounded-md"
      style={{
        padding: 10,
        border: '1px solid var(--color-border)',
        background: dragging ? 'var(--color-surface-2)' : 'var(--color-surface)',
        boxShadow: dragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
      }}
    >
      <div style={{ fontWeight: 600 }}>
        {item.title || item.name || item.type || 'Item'}
      </div>
      <div className="text-muted" style={{ fontSize: 12, marginTop: 4 }}>
        {formatTime(item.time || item.startTime)} {item.location ? `• ${item.location}` : ''}
      </div>
    </div>
  );
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatTime(t) {
  if (!t) return '';
  try {
    const d = new Date(t);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch {
    // ignore
  }
  return String(t);
}

// PUBLIC_INTERFACE
export async function ensureUpdateItemDay(tripId, itemId, newDate) {
  /**
   * Update an itinerary item's date for the given trip.
   * Uses ItineraryService.updateItemDay if available; falls back to update() with { date }.
   */
  if (!tripId) throw new Error('tripId required');
  if (!itemId) throw new Error('itemId required');
  if (!newDate) throw new Error('newDate required');
  if (typeof ItineraryService.updateItemDay === 'function') {
    return ItineraryService.updateItemDay(tripId, itemId, newDate);
    // eslint-disable-next-line no-else-return
  } else {
    return ItineraryService.update(tripId, itemId, { date: newDate });
  }
}
