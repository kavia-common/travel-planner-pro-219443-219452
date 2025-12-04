import React, { useState } from 'react';
import ItineraryView from '../components/itinerary/ItineraryView';
import CalendarItinerary from '../components/itinerary/CalendarItinerary';
import PackingList from '../components/packing/PackingList';
import BudgetDashboard from '../components/budget/BudgetDashboard';
import Card from '../components/common/Card';

/**
 * PUBLIC_INTERFACE
 * TripDetails page with themed tabs and header.
 */
const TripDetails = () => {
  const [active, setActive] = useState('itinerary');

  const Tab = ({ id, children }) => (
    <button
      className={`tab ${active === id ? 'active' : ''}`}
      onClick={() => setActive(id)}
      role="tab"
      aria-selected={active === id}
    >
      {children}
    </button>
  );

  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'}}>
            <div>
              <div className="badge">Active Trip</div>
              <div style={{ fontWeight: 800, fontSize: '20px', marginTop: 6 }}>Trip Details</div>
            </div>
            <div><span className="chip chip--amber">Ocean theme</span></div>
          </div>
        </div>
        <div className="card-body">
          <div className="tabs" role="tablist" aria-label="Trip Sections">
            <Tab id="itinerary">Itinerary</Tab>
            <Tab id="calendar">Calendar</Tab>
            <Tab id="packing">Packing</Tab>
            <Tab id="budget">Budget</Tab>
          </div>
        </div>
      </div>

      <Card>
        {active === 'itinerary' && <ItineraryView />}
        {active === 'calendar' && <CalendarItinerary />}
        {active === 'packing' && <PackingList />}
        {active === 'budget' && <BudgetDashboard />}
      </Card>
    </div>
  );
};

export default TripDetails;
