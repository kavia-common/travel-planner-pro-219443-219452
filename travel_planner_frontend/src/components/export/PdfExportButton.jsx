import React, { useMemo, useState } from 'react';
import Button from '../common/Button';
import PdfExportModal from './PdfExportModal';
import * as pdfService from '../../services/pdfService';

// PUBLIC_INTERFACE
export default function PdfExportButton({ trip, items }) {
  /** Simple export button with modal trigger and PDF generation. */
  const [open, setOpen] = useState(false);
  const defaultOptions = useMemo(
    () => ({
      paperSize: 'a4',
      orientation: 'portrait',
      include: { cover: true, dailySchedule: true, packing: false, budget: false, mapSnapshot: false },
      theme: 'ocean',
      showPageNumbers: true,
    }),
    []
  );

  const onConfirm = async (opts, setProgress) => {
    await pdfService.exportItineraryPdf({ trip, items, options: opts, onProgress: setProgress });
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)} ariaLabel="Export itinerary as PDF">
        Export
      </Button>
      <PdfExportModal open={open} onClose={() => setOpen(false)} onConfirm={onConfirm} defaultOptions={defaultOptions} />
    </>
  );
}
