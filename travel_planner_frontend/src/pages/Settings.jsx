import React, { useRef, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import HealthService from '../services/healthService';

/**
 * PUBLIC_INTERFACE
 * Settings page: manage preferences and account settings.
 */
export default function Settings() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState({ ok: null, text: 'Not checked' });
  const liveRef = useRef(null);

  async function handleCheck() {
    setChecking(true);
    try {
      const res = await HealthService.pingHealth();
      const text = res.ok ? 'Online' : 'Offline';
      setStatus({ ok: res.ok, text });
      if (liveRef.current) {
        liveRef.current.textContent = `Backend status: ${text}`;
      }
    } finally {
      setChecking(false);
    }
  }

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
  };

  const dotColor = status.ok === null ? '#CBD5E1' : (status.ok ? '#10B981' : '#EF4444');

  return (
    <Card title="Settings" subtitle="Personalize your Travel Planner Pro experience">
      <div className="text-muted">Theme, notifications, and other preferences will appear here.</div>

      <div className="mt-4" role="region" aria-label="Service status">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div role="status" aria-live="polite" aria-atomic="true" style={badgeStyle} title={`Backend status: ${status.text}`}>
            <span aria-hidden style={{
              width: 10, height: 10, borderRadius: '50%', background: dotColor,
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)',
              display: 'inline-block'
            }} />
            <span ref={liveRef} style={{ fontSize: 13 }}>
              Backend status: {status.text}
            </span>
          </div>
          <Button variant="primary" onClick={handleCheck} disabled={checking} ariaLabel="Check backend status now">
            {checking ? 'Checking…' : 'Check status'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
