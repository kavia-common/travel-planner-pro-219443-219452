import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../components/common/Card';
import CalendarItinerary from '../components/itinerary/CalendarItinerary';
import { useItinerary } from '../hooks/useItinerary';
import BudgetDashboard from '../components/budget/BudgetDashboard';
import { isFeatureEnabled } from '../flags/featureFlags';

/**
 * PUBLIC_INTERFACE
 * TripDetails
 * Displays details of a specific trip with tabs. Shows Itinerary and, if enabled, a Budget tab.
 */
const TripDetails = () => {
  const { id } = useParams();
  const { itinerary, addItem, updateItem, removeItem } = useItinerary(id);

  const hasBudget = isFeatureEnabled('FEATURE_BUDGET');
  const tabsBase = useMemo(() => ([
    { key: 'itinerary', label: 'Itinerary' },
    ...(hasBudget ? [{ key: 'budget', label: 'Budget' }] : []),
  ]), [hasBudget]);
  const [active, setActive] = useState('itinerary');

  return (
    <div className="p-4 space-y-4">
      <Card>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Trip Details</h2>
        <p className="text-sm text-gray-600">Trip ID: {id}</p>
      </Card>

      <div className="bg-white rounded-md shadow-sm border">
        <div className="flex gap-2 p-2 border-b overflow-x-auto">
          {tabsBase.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className={`px-3 py-2 rounded-md text-sm transition ${
                active === tab.key ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-4">
          {active === 'itinerary' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Itinerary</h3>
              <CalendarItinerary
                tripId={id}
                itinerary={itinerary}
                onAdd={addItem}
                onUpdate={updateItem}
                onRemove={removeItem}
              />
            </Card>
          )}
          {hasBudget && active === 'budget' && (
            <BudgetDashboard tripId={id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
