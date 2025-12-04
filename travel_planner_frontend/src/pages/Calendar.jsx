import React, { useEffect } from 'react';
import Card from '../components/common/Card';
import CalendarView from '../components/calendar/CalendarView';
import { useTrips } from '../hooks/useTrips';
import { useItinerary } from '../hooks/useItinerary';

/**
 * PUBLIC_INTERFACE
 * Calendar page: visualize trips and itineraries on a timeline/calendar.
 */
export default function Calendar() {
  const { trips, loadTrips } = useTrips();
  // For a simple calendar demo, aggregate itinerary of selected trip if any
  const selectedTripId = null; // could wire from store later
  const { items, loadItinerary } = useItinerary(selectedTripId);

  useEffect(() => {
    loadTrips({ page: 1, pageSize: 20 }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedTripId) loadItinerary().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTripId]);

  // Compose items from trips as placeholder "date blocks" if no itinerary
  const calendarItems = (items && items.length > 0)
    ? items
    : trips.map((t) => ({
        id: t.id,
        title: t.name || t.title || 'Trip',
        time: t.startDate || '',
        location: t.destination || '',
      }));

  return (
    <Card title="Calendar" subtitle="Plan and visualize your travel dates">
      <CalendarView items={calendarItems} />
    </Card>
  );
}
