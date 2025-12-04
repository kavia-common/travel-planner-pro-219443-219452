import React, { useMemo, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

// PUBLIC_INTERFACE
export default function PdfExportModal({ open, onClose, onConfirm, defaultOptions }) {
  /** Modal that lets users configure itinerary PDF export options. */
  const initial = useMemo(
    () => ({
      paperSize: 'a4',
      orientation: 'portrait',
      include: {
        cover: true,
        dailySchedule: true,
        packing: false,
        budget: false,
        mapSnapshot: false,
      },
      theme: 'ocean',
      showPageNumbers: true,
      ...defaultOptions,
    }),
    [defaultOptions]
  );

  const [options, setOptions] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ step: 'Idle', value: 0 });

  const handleToggle = (path) => {
    setOptions((o) => {
      const copy = JSON.parse(JSON.stringify(o));
      const parts = path.split('.');
      let ref = copy;
      for (let i = 0; i < parts.length - 1; i++) ref = ref[parts[i]];
      ref[parts[parts.length - 1]] = !ref[parts[parts.length - 1]];
      return copy;
    });
  };

  const handleChange = (key, value) => setOptions((o) => ({ ...o, [key]: value }));

  const handleSubmit = async () => {
    setBusy(true);
    try {
      await onConfirm?.(options, setProgress);
      onClose?.();
    } finally {
      setBusy(false);
      setProgress({ step: 'Idle', value: 0 });
    }
  };

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title="Export Itinerary as PDF">
      <div className="grid" style={{ gap: 12 }}>
        <div className="grid-1-2-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label className="text-sm font-semibold">Paper size</label>
            <select
              className="select"
              value={options.paperSize}
              onChange={(e) => handleChange('paperSize', e.target.value)}
              disabled={busy}
            >
              <option value="a4">A4</option>
              <option value="letter">Letter</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold">Orientation</label>
            <select
              className="select"
              value={options.orientation}
              onChange={(e) => handleChange('orientation', e.target.value)}
              disabled={busy}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div className="font-semibold mb-2">Include sections</div>
          <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.include.cover}
                onChange={() => handleToggle('include.cover')}
                disabled={busy}
              />
              Cover page
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.include.dailySchedule}
                onChange={() => handleToggle('include.dailySchedule')}
                disabled={busy}
              />
              Daily schedule
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.include.packing}
                onChange={() => handleToggle('include.packing')}
                disabled={busy}
              />
              Packing summary
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.include.budget}
                onChange={() => handleToggle('include.budget')}
                disabled={busy}
              />
              Budget summary
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.include.mapSnapshot}
                onChange={() => handleToggle('include.mapSnapshot')}
                disabled={busy}
              />
              Map snapshot placeholder
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!options.showPageNumbers}
                onChange={() => handleToggle('showPageNumbers')}
                disabled={busy}
              />
              Show page numbers
            </label>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold">Theme</label>
          <select
            className="select"
            value={options.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            disabled={busy}
          >
            <option value="ocean">Ocean Professional (default)</option>
          </select>
        </div>

        {busy && (
          <div className="progress" aria-live="polite" style={{ marginTop: 6 }}>
            <div className="bar" style={{ width: `${progress.value || 15}%` }} />
            <div className="text-xs mt-1 text-gray-600">{progress.step}…</div>
          </div>
        )}

        <div className="flex" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={busy}>
            {busy ? 'Exporting…' : 'Export PDF'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
