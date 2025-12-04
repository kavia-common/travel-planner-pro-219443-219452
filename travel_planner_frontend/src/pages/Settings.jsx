import React, { useMemo, useRef, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import HealthService from '../services/healthService';
import { allFlags, experimentsOn, isEnabled, setOverride, clearOverride, FEATURE_NOTIFICATIONS } from '../flags/featureFlags';
import NotificationService from '../services/notificationService';

/**
 * PUBLIC_INTERFACE
 * Settings page: manage preferences and account settings.
 * Adds a Feature Flags section that:
 * - Shows active flags and key=value entries (read-only snapshot from env + overrides)
 * - Shows experiments toggle state (env-driven)
 * - If experiments are enabled, exposes a local override demo control for `liveUpdates`
 *   which writes to localStorage and merges for the session.
 */
export default function Settings() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState({ ok: null, text: 'Not checked' });
  const liveRef = useRef(null);

  // Flags snapshot (recomputed lazily as needed via helper)
  const snapshot = useMemo(() => allFlags(), []);
  const experimentsEnabled = experimentsOn();

  const liveUpdatesActive = isEnabled('liveUpdates');

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

  function toggleLiveUpdates() {
    // client-side only override for demo; respects experimentsOn gate
    if (!experimentsEnabled) return;
    // Flip boolean override. If currently active (from env or prior override), set false; else set true.
    const next = !isEnabled('liveUpdates');
    if (next) setOverride('liveUpdates', true);
    else clearOverride('liveUpdates');
    // Force a local UI refresh by updating an inert state or reading the live value via isEnabled in render paths
    // Here we simply update a dummy state by changing status text (no-op to re-render). Simpler: use a timestamp state.
    setStatus((s) => ({ ...s }));
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

  // Render helpers
  const flagList = snapshot.flags || [];
  const valueEntries = Object.entries(snapshot.values || {});

  const [prefs, setPrefs] = useState(null);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsError, setPrefsError] = useState(null);

  async function loadPrefs() {
    setPrefsLoading(true);
    setPrefsError(null);
    try {
      const res = await NotificationService.getPreferences();
      setPrefs(res || {});
    } catch (e) {
      setPrefsError(e);
    } finally {
      setPrefsLoading(false);
    }
  }

  async function savePrefs(next) {
    setPrefsLoading(true);
    setPrefsError(null);
    try {
      const saved = await NotificationService.updatePreferences(next);
      setPrefs(saved || next);
    } catch (e) {
      setPrefsError(e);
    } finally {
      setPrefsLoading(false);
    }
  }

  React.useEffect(() => {
    if (isEnabled(FEATURE_NOTIFICATIONS)) {
      loadPrefs();
    }
  }, []);

  return (
    <Card title="Settings" subtitle="Personalize your Travel Planner Pro experience">
      <div className="text-muted">Theme, notifications, and other preferences will appear here.</div>

      {isEnabled(FEATURE_NOTIFICATIONS) && (
        <div className="mt-4" role="region" aria-label="Notification preferences">
          <Card
            title="Notifications"
            subtitle="Choose how you want to be notified about trip updates, itinerary changes, and reminders."
          >
            {prefsLoading && <div className="text-muted" role="status" aria-live="polite">Loading preferences…</div>}
            {prefsError && !prefsLoading && <div role="alert">Failed to load preferences.</div>}
            {prefs && !prefsLoading && (
              <div style={{ display: 'grid', gap: 12 }}>
                <PreferenceToggle
                  label="Trip updates"
                  description="Get notified when trips are created, updated, or shared with you."
                  checked={!!prefs.tripUpdates}
                  onChange={(v) => setPrefs((p) => ({ ...(p || {}), tripUpdates: v }))}
                />
                <PreferenceToggle
                  label="Itinerary changes"
                  description="Receive alerts when itinerary items are added, updated, or removed."
                  checked={!!prefs.itineraryChanges}
                  onChange={(v) => setPrefs((p) => ({ ...(p || {}), itineraryChanges: v }))}
                />
                <PreferenceToggle
                  label="Budget alerts"
                  description="Notify me about budget thresholds and expense changes."
                  checked={!!prefs.budgetAlerts}
                  onChange={(v) => setPrefs((p) => ({ ...(p || {}), budgetAlerts: v }))}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button
                    variant="primary"
                    onClick={() => savePrefs(prefs)}
                    disabled={prefsLoading}
                    ariaLabel="Save notification preferences"
                  >
                    {prefsLoading ? 'Saving…' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={loadPrefs}
                    disabled={prefsLoading}
                    ariaLabel="Reload notification preferences"
                  >
                    Reload
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

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

      <div className="mt-4" role="region" aria-label="Feature flags">
        <Card
          title="Feature Flags"
          subtitle="Current flags and experiments. Production flags are environment-driven; local overrides are for demo only."
        >
          <div className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
            Flags are parsed from REACT_APP_FEATURE_FLAGS at build time. Key=value flags appear under Values.
            Experiments switch (REACT_APP_EXPERIMENTS_ENABLED) gates client-only override controls in this page.
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <div className="surface rounded-md" style={{ padding: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Experiments</div>
              <div className="text-muted" style={{ fontSize: 14 }}>
                {experimentsEnabled ? 'Enabled' : 'Disabled'} (REACT_APP_EXPERIMENTS_ENABLED)
              </div>
            </div>

            <div className="surface rounded-md" style={{ padding: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Active Flags</div>
              {flagList.length === 0 ? (
                <div className="text-muted" style={{ fontSize: 14 }}>No boolean flags enabled.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {flagList.map((f) => (
                    <li key={f} className="rounded-sm" style={{ padding: '6px 8px', border: '1px dashed var(--color-border)' }}>
                      <code>{f}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="surface rounded-md" style={{ padding: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Flag Values (key=value)</div>
              {valueEntries.length === 0 ? (
                <div className="text-muted" style={{ fontSize: 14 }}>No key=value flags present.</div>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
                  {valueEntries.map(([k, v]) => (
                    <li key={k} className="rounded-sm" style={{ padding: '6px 8px', border: '1px dashed var(--color-border)' }}>
                      <code>{k}</code> = <code>{String(v)}</code>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="surface rounded-md" style={{ padding: 12, border: '1px solid var(--color-border)' }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Demo Override</div>
              <div className="text-muted" style={{ fontSize: 13, marginBottom: 8 }}>
                Local overrides affect only this browser and session. They are intended for demos and do not modify production configuration.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!liveUpdatesActive}
                    onChange={toggleLiveUpdates}
                    disabled={!experimentsEnabled}
                    aria-disabled={!experimentsEnabled}
                  />
                  <span>Enable live updates (WS) locally</span>
                </label>
                {!experimentsEnabled && (
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Experiments disabled — override controls are unavailable.
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}

function PreferenceToggle({ label, description, checked, onChange }) {
  return (
    <label
      style={{
        display: 'grid',
        gap: 4,
        padding: 12,
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--color-surface)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          aria-checked={!!checked}
        />
        <span style={{ fontWeight: 600 }}>{label}</span>
      </div>
      {description && <div className="text-muted" style={{ fontSize: 13 }}>{description}</div>}
    </label>
  );
}
