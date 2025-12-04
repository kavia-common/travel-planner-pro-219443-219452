import React from 'react';

// PUBLIC_INTERFACE
export default function DayList({ days = [], daysMap = new Map(), onFocusDay, onAddPlace, renderItem }) {
  /** Renders days with destination badges, times, and quick actions. */
  return (
    <div className="space-y-3">
      {days.map((d) => {
        const items = daysMap.get(d) || [];
        const topDest = items.find((i) => i.location?.city || i.location?.name || i.destination);
        const badge = topDest?.location?.city || topDest?.destination || topDest?.location?.name || '—';
        return (
          <div key={d} className="border border-gray-100 rounded-md overflow-hidden">
            <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="badge">{d}</span>
                <span className="chip chip--amber">{badge}</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-100" onClick={() => onFocusDay && onFocusDay(d)}>
                  Focus on map
                </button>
                {onAddPlace && (
                  <button className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => onAddPlace(d)}>
                    Add place
                  </button>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {items.length === 0 && (
                <div className="px-3 py-3 text-sm text-gray-500">No items</div>
              )}
              {items.map((it) => renderItem ? renderItem(it) : (
                <div className="px-3 py-2 text-sm" key={it.id}>
                  {it.title || it.type} {it.time ? <span className="text-gray-500">({it.time})</span> : null}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
