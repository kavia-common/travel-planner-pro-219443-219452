import React from 'react';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
export default function SearchResultItem({ item }) {
  /** Render a search result row with icon, text, and chip by type. */
  const navigate = useNavigate();
  if (!item) return null;
  const icon = item.__type === 'trip' ? '🧳' :
    item.__type === 'itinerary' ? '📅' :
    item.__type === 'packing' ? '✅' :
    item.__type === 'expense' ? '💰' :
    item.__type === 'place' ? '📍' : '🔎';
  const chip = (item.__type || 'item').toString();

  return (
    <div
      className="px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center justify-between cursor-pointer transition"
      onClick={() => item.url && navigate(item.url)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && item.url) navigate(item.url);
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="font-medium text-gray-900">{item.primary}</div>
          {item.secondary ? <div className="text-xs text-gray-500">{item.secondary}</div> : null}
        </div>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">
        {chip}
      </span>
    </div>
  );
}
