import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * TripDetails page: displays details for a specific trip.
 */
export default function TripDetails() {
  const { tripId } = useParams();

  return (
    <Card title={`Trip Details`} subtitle={`Trip ID: ${tripId}`}>
      <div className="text-muted">
        This is where you will see itinerary, bookings, and notes for the selected trip.
      </div>
    </Card>
  );
}
