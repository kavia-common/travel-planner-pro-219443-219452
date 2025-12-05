import React from 'react';

/**
 * PUBLIC_INTERFACE
 * TripPreview - visual preview of a draft trip itinerary (days & activities).
 * Props:
 *  - trip: { name, startDate, endDate, templateId?, days?: TemplateDayLike[] }
 */
export default function TripPreview({ trip }) {
  if (!trip) return null;

  const { name, startDate, endDate, days = [], templateId } = trip;

  return (
    <section
      aria-label="Trip preview"
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        background: '#ffffff',
        boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
        border: '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              color: '#111827',
            }}
          >
            {name || 'New Trip'}
          </h3>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 14,
              color: '#6B7280',
            }}
          >
            {startDate && endDate
              ? `${startDate} → ${endDate}`
              : 'Dates will be set when you confirm.'}
          </p>
        </div>
        {templateId && (
          <span className="badge chip--amber">
            From template
          </span>
        )}
      </header>

      {Array.isArray(days) && days.length > 0 ? (
        <div
          className="grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
            marginTop: 8,
          }}
        >
          {days.map((day) => (
            <article
              key={day.dayIndex ?? day.title}
              className="card"
              style={{
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '10px 12px',
                  background:
                    'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(249,250,251,1))',
                  borderBottom: '1px solid rgba(15,23,42,0.06)',
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: 15,
                    color: '#111827',
                  }}
                >
                  {day.title || `Day ${String(day.dayIndex + 1 || 1)}`}
                </h4>
                <p
                  style={{
                    margin: '2px 0 0',
                    fontSize: 12,
                    color: '#6B7280',
                  }}
                >
                  {day.notes || 'You can edit activities after saving this trip.'}
                </p>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: '10px 12px 12px',
                  listStyle: 'none',
                  fontSize: 12,
                  color: '#4B5563',
                  maxHeight: 220,
                  overflowY: 'auto',
                }}
              >
                {(day.activities || []).map((act, idx) => (
                  <li
                    key={`${act.time || idx}-${act.title || idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 8,
                      padding: '4px 0',
                      borderBottom:
                        idx < (day.activities || []).length - 1
                          ? '1px dashed rgba(15,23,42,0.06)'
                          : 'none',
                    }}
                  >
                    <div
                      style={{
                        minWidth: 52,
                        fontVariantNumeric: 'tabular-nums',
                        color: '#1F2937',
                      }}
                    >
                      {act.time || '–'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: 500,
                          marginBottom: 2,
                        }}
                      >
                        {act.title || 'Untitled activity'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 4,
                          alignItems: 'center',
                          color: '#6B7280',
                        }}
                      >
                        {act.category && (
                          <span
                            className="chip"
                            style={{ fontSize: 11, paddingInline: 6 }}
                          >
                            {act.category}
                          </span>
                        )}
                        {typeof act.durationMins === 'number' &&
                          act.durationMins > 0 && (
                            <span style={{ fontSize: 11 }}>
                              {Math.round(act.durationMins)} min
                            </span>
                          )}
                      </div>
                    </div>
                  </li>
                ))}
                {(!day.activities || day.activities.length === 0) && (
                  <li
                    style={{
                      paddingTop: 4,
                      color: '#9CA3AF',
                    }}
                  >
                    No activities yet – you can add your own later.
                  </li>
                )}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: '#9CA3AF',
          }}
        >
          This template has no day structure yet. You can create activities
          manually after saving the trip.
        </p>
      )}
    </section>
  );
}
