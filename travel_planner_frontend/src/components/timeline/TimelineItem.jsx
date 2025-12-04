import React from 'react';

// PUBLIC_INTERFACE
export default function TimelineItem({ item, onFocus }) {
  /** Renders itinerary item row with time, title, and place info. */
  const when = item.time || (item.date ? new Date(item.date).toLocaleDateString() : '');
  const where = item.location?.name || item.location?.city || item.destination || '';
  return (
    <div className="px-3 py-2 text-sm flex items-center justify-between hover:bg-gray-50">
      <div>
        <div className="font-medium text-gray-800">{item.title || item.type || 'Item'}</div>
        <div className="text-xs text-gray-600">
          {when} {where ? `• ${where}` : ''}
        </div>
      </div>
      <div>
        <button className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100" onClick={() => onFocus && onFocus()}>
          Focus
        </button>
      </div>
    </div>
  );
}
