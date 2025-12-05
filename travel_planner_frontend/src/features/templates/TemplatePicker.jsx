import React from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { TRIP_TEMPLATES } from './templates';

/**
 * PUBLIC_INTERFACE
 * TemplatePicker - displays available trip templates as selectable cards.
 * Props:
 *  - onSelect(template): called when user chooses a template.
 */
export default function TemplatePicker({ onSelect }) {
  return (
    <div>
      <header
        style={{
          padding: '16px 20px',
          marginBottom: 12,
          borderRadius: '12px',
          background:
            'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(249,250,251,1))',
          border: '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          Start from a template
          <span className="badge--secondary badge" style={{ marginLeft: 4 }}>
            New
          </span>
        </h3>
        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            fontSize: 14,
            color: '#6B7280',
          }}
        >
          Choose a curated itinerary structure and customize it from there. Great
          for fast planning.
        </p>
      </header>

      <div
        className="grid grid-1-2-3"
        style={{ gap: 16, marginTop: 4 }}
        aria-label="Trip templates"
      >
        {TRIP_TEMPLATES.map((template) => (
          <article
            key={template.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            <div
              className="card-header"
              style={{
                padding: '16px 18px 10px',
                background:
                  'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(249,250,251,1))',
                borderBottom: '1px solid rgba(15,23,42,0.06)',
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                {template.name}
              </h4>
              <div
                style={{
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                }}
              >
                <span className="chip chip--amber">
                  {template.recommendedDurationDays} day
                  {template.recommendedDurationDays > 1 ? 's' : ''}
                </span>
                {template.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="card-body"
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flexGrow: 1,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: '#4B5563',
                }}
              >
                {template.description}
              </p>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '8px 0 0',
                  fontSize: 13,
                  color: '#6B7280',
                }}
              >
                <li>
                  • Includes {template.days.length} structured day
                  {template.days.length > 1 ? 's' : ''}
                </li>
                <li>• Ready-made titles and activities per day</li>
                <li>• Fully editable after you start</li>
              </ul>
            </div>
            <footer
              style={{
                padding: '10px 16px 14px',
                borderTop: '1px solid rgba(15,23,42,0.06)',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="primary"
                type="button"
                onClick={() => onSelect?.(template)}
                aria-label={`Use ${template.name} template`}
              >
                Use template
              </Button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
