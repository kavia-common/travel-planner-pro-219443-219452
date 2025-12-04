import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ItineraryPdfDocument, { styles as printStyles } from '../components/export/ItineraryPdfDocument';

/**
 * PUBLIC_INTERFACE
 * exportItineraryPdf - Renders a hidden ItineraryPdfDocument and exports it to a multi-page PDF.
 * Options: { paperSize: 'a4'|'letter', orientation: 'portrait'|'landscape', include: {...}, theme: 'ocean', showPageNumbers: boolean }
 */
export async function exportItineraryPdf({ trip, items, options, onProgress }) {
  const progress = (step, value) => {
    try {
      onProgress?.({ step, value });
    } catch { /* ignore */ }
  };

  progress('Preparing layout', 10);

  // Create a container off-screen
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '1124px'; // generous width to avoid line reflows before scaling
  document.body.appendChild(container);

  // Inject print-scoped CSS
  const styleEl = document.createElement('style');
  styleEl.innerHTML = printStyles;
  container.appendChild(styleEl);

  // Render the document
  const root = createRoot(container);
  await new Promise((resolve) => {
    root.render(
      <ItineraryPdfDocument trip={trip} items={items} options={options} />
    );
    // allow layout flush
    setTimeout(resolve, 50);
  });

  progress('Rendering pages', 35);

  // Determine page size
  const orientation = options?.orientation === 'landscape' ? 'l' : 'p';
  const paper = options?.paperSize === 'letter' ? 'letter' : 'a4';

  // Use jsPDF with pixel unit for easier mapping
  const doc = new jsPDF({
    orientation,
    unit: 'px',
    format: paper,
    hotfixes: ['px_scaling'],
    compress: true,
    putOnlyUsedFonts: true,
  });

  // Calculate page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Capture content as one tall canvas then paginate by slicing
  const target = container.querySelector('.pdf-root');
  const canvas = await html2canvas(target, {
    scale: 2, // higher scale for crisp text
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: target.scrollWidth,
    windowHeight: target.scrollHeight,
  });

  progress('Composing PDF', 70);

  const imgData = canvas.toDataURL('image/png');
  // Compute height of one PDF page for the image when scaled to pageWidth
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Slice the tall image across pages
  let position = 0;
  const pageCount = Math.ceil(imgHeight / pageHeight);
  for (let i = 0; i < pageCount; i++) {
    if (i > 0) doc.addPage();
    const srcY = Math.floor((i * pageHeight * canvas.width) / pageWidth);
    const sliceHeight = Math.floor((pageHeight * canvas.width) / pageWidth);

    // Create a temporary slice canvas to avoid rendering off-page parts
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeight;
    const sctx = sliceCanvas.getContext('2d');
    sctx.drawImage(
      canvas,
      0,
      srcY,
      canvas.width,
      sliceHeight,
      0,
      0,
      sliceCanvas.width,
      sliceCanvas.height
    );
    const sliceImg = sliceCanvas.toDataURL('image/png');
    doc.addImage(sliceImg, 'PNG', 0, 0, pageWidth, pageHeight);

    if (options?.showPageNumbers !== false) addFooter(doc, i + 1, pageCount);
    progress('Composing PDF', 70 + Math.round(((i + 1) / pageCount) * 25));
    position += pageHeight;
  }

  progress('Finalizing', 98);
  const tripName = (trip?.name || 'itinerary').replace(/[^\w\-]+/g, '_');
  doc.save(`${tripName}.pdf`);

  // Cleanup
  try {
    root.unmount();
  } catch { /* ignore */ }
  container.remove();
  progress('Done', 100);
}

function addFooter(doc, pageNum, total) {
  const footer = `Page ${pageNum} of ${total}`;
  doc.setFontSize(10);
  doc.setTextColor(90);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textWidth = doc.getTextWidth(footer);
  doc.text(footer, pageWidth - textWidth - 12, pageHeight - 10);
}
