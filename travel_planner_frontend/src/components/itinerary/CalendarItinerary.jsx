import React from 'react';

/**
 * PUBLIC_INTERFACE
 * Calendar Itinerary styled to match Ocean Professional cards with sticky day headers.
 * Note: If a full DnD version exists elsewhere, integrate utilities there; this is a themed baseline.
 */
const CalendarItinerary = () => {
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  return (
    <div className="grid grid-1-2-3">
      {days.map((d) => (
        <div key={d} className="card">
          <div className="card-header sticky-top">
            <span className="badge">{d}</span>
          </div>
          <div className="card-body">
            <div className="text-muted" style={{fontSize:'14px'}}>Drag activities here</div>
            <div className="p-4" style={{border:'1px dashed rgba(17,24,39,0.15)', borderRadius:'8px', marginTop:'12px'}}>
              <div className="chip">Flight</div>
              <div className="chip" style={{marginLeft:8}}>Hotel</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarItinerary;
