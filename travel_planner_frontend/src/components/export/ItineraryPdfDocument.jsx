import React from 'react';
import { getDailyItinerary } from '../../services/itineraryService';

// PUBLIC_INTERFACE
export default function ItineraryPdfDocument({ trip, items = [], options }) {
  /**
   * This component is meant to be rendered off-screen for capture into PDF.
   * It applies print-safe styles and produces deterministic layout blocks.
   */
  const include = options?.include || {};
  const dayMap = getDailyItinerary({ items });

  const formatDate = (d) => {
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
    } catch {
      return d || '';
    }
  };

  return (
    <div className={`pdf-root theme-ocean ${options?.orientation || 'portrait'}`} data-paper={options?.paperSize || 'a4'}>
      {/* Cover */}
      {include.cover !== false && (
        <section className="pdf-section cover">
          <div className="cover-header">
            <div className="brand">Travel Planner Pro</div>
            <div className="brand-sub">Ocean Professional</div>
          </div>
          <div className="cover-body">
            <h1 className="title">{trip?.name || 'Trip Itinerary'}</h1>
            <div className="meta">
              {trip?.startDate && trip?.endDate ? (
                <div className="chip">
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </div>
              ) : null}
              {trip?.travelerCount ? <div className="chip">{trip.travelerCount} travelers</div> : null}
              {trip?.destinations?.length ? (
                <div className="chip">
                  {trip.destinations.join(' · ')}
                </div>
              ) : null}
            </div>
          </div>
          {include.mapSnapshot && (
            <div className="cover-map-placeholder">
              <div className="placeholder">Map snapshot</div>
            </div>
          )}
        </section>
      )}

      {/* Summary */}
      <section className="pdf-section summary">
        <h2 className="h2">Trip summary</h2>
        <div className="summary-grid">
          <div className="summary-card">
            <div className="label">Trip name</div>
            <div className="value">{trip?.name || 'Untitled trip'}</div>
          </div>
          <div className="summary-card">
            <div className="label">Dates</div>
            <div className="value">
              {trip?.startDate ? formatDate(trip.startDate) : '—'} — {trip?.endDate ? formatDate(trip.endDate) : '—'}
            </div>
          </div>
          <div className="summary-card">
            <div className="label">Destinations</div>
            <div className="value">
              {Array.isArray(trip?.destinations) && trip.destinations.length > 0 ? trip.destinations.join(', ') : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Daily schedule */}
      {include.dailySchedule !== false && (
        <section className="pdf-section schedule">
          <h2 className="h2">Daily schedule</h2>
          {[...dayMap.entries()].map(([day, arr]) => (
            <div className="day-block" key={day || Math.random()}>
              <div className="day-header">
                <div className="day-date">{day ? formatDate(day) : 'Undated'}</div>
              </div>
              <div className="items">
                {arr.map((it) => (
                  <div className="it" key={it.id || `${it.title}-${it.time}-${Math.random()}`}>
                    <div className="time">{it.time || it.startTime || ''}</div>
                    <div className="content">
                      <div className="title">{it.title || it.location?.name || it.destination || 'Activity'}</div>
                      {it.location?.address || it.location?.city ? (
                        <div className="sub">{[it.location?.address, it.location?.city, it.location?.country].filter(Boolean).join(', ')}</div>
                      ) : null}
                      {it.notes ? <div className="notes">{it.notes}</div> : null}
                    </div>
                  </div>
                ))}
                {arr.length === 0 && <div className="it empty">No items</div>}
              </div>
            </div>
          ))}
          {dayMap.size === 0 && <div className="text-muted">No itinerary items available.</div>}
        </section>
      )}

      {/* Optional sections, rendered only if non-empty or explicitly requested */}
      {include.packing && (
        <section className="pdf-section optional">
          <h2 className="h2">Packing summary</h2>
          <div className="text-muted">Packing list not available in export context.</div>
        </section>
      )}
      {include.budget && (
        <section className="pdf-section optional">
          <h2 className="h2">Budget summary</h2>
          <div className="text-muted">Budget data not included in this export.</div>
        </section>
      )}
    </div>
  );
}

/* Print-safe styles scoped to .pdf-root to avoid affecting app UI */
export const styles = `
.pdf-root {
  --primary: #2563EB;
  --amber: #F59E0B;
  --surface: #ffffff;
  --text: #111827;
  --muted: #6B7280;
  color: var(--text);
  background: var(--surface);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
  padding: 24px;
  width: 794px; /* A4 portrait px at 96dpi approx */
}
.pdf-root[data-paper="letter"] { width: 816px; } /* Letter portrait approx */
.pdf-root.landscape { width: 1123px; } /* A4 landscape approx */
.pdf-root .pdf-section { page-break-inside: avoid; margin-bottom: 24px; }
.pdf-root .cover { display: grid; gap: 16px; border: 2px solid rgba(37,99,235,0.15); padding: 24px; border-radius: 12px; }
.pdf-root .cover .cover-header { display:flex; align-items:center; justify-content: space-between; }
.pdf-root .brand { font-weight: 800; color: var(--primary); font-size: 18px; }
.pdf-root .brand-sub { color: var(--amber); font-weight: 600; }
.pdf-root .cover .title { font-size: 32px; line-height: 1.2; margin: 8px 0 4px; }
.pdf-root .cover .meta { display:flex; gap: 8px; flex-wrap: wrap; }
.pdf-root .chip { padding: 4px 8px; border-radius: 999px; background: rgba(37,99,235,0.08); color: var(--primary); font-weight: 600; font-size: 12px; }
.pdf-root .cover-map-placeholder { border: 1px dashed #d1d5db; height: 160px; display:grid; place-items:center; color: var(--muted); border-radius: 8px; }
.pdf-root .h2 { font-size: 18px; margin: 8px 0 12px; color: var(--primary); }
.pdf-root .summary-grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.pdf-root .summary-card { border:1px solid #e5e7eb; border-radius: 8px; padding: 10px; background: #fff; }
.pdf-root .summary-card .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
.pdf-root .summary-card .value { font-size: 14px; margin-top: 4px; }
.pdf-root .day-block { border-top: 2px solid rgba(37,99,235,0.1); padding-top: 12px; margin-top: 8px; }
.pdf-root .day-header { display:flex; align-items:center; justify-content: space-between; margin-bottom: 6px; }
.pdf-root .day-date { font-weight: 700; color: #0f172a; }
.pdf-root .items { display:flex; flex-direction: column; gap: 8px; }
.pdf-root .it { display:grid; grid-template-columns: 88px 1fr; gap: 12px; border:1px solid #e5e7eb; border-radius: 8px; padding: 8px; }
.pdf-root .it .time { font-weight: 700; color: var(--primary); }
.pdf-root .it .content .title { font-weight: 700; }
.pdf-root .it .content .sub { color: var(--muted); font-size: 12px; }
.pdf-root .it .content .notes { margin-top: 2px; font-size: 12px; color: #374151; }
.pdf-root .it.empty { display: block; padding: 8px; text-align: center; color: var(--muted); border-style: dashed; }
.pdf-root .text-muted { color: var(--muted); }
@media print {
  .pdf-root { padding: 0; width: auto; }
  .pdf-root .pdf-section { break-inside: avoid; }
}
`;
