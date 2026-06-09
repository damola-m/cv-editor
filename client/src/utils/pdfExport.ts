/* ===================================
   pdfExport.ts
   -----------------------------------
   - Direct PDF download — no print dialog.
   - Scales each 1191×842px InDesign page to A3
     (1587×1123px at 96dpi = 420×297mm) then rasterises
     with html2canvas and embeds in jsPDF.
   - Tries progressive quality to stay under 5MB.
   =================================== */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const A3W_MM = 420
const A3H_MM = 297
const A3W_PX = Math.round(A3W_MM * 96 / 25.4)  // 1587
const A3H_PX = Math.round(A3H_MM * 96 / 25.4)  // 1123
const PAGE_W  = 1191   // InDesign native width
const PAGE_H  = 842    // InDesign native height
const FIT     = A3W_PX / PAGE_W  // 1.3325 — fills A3 exactly

// ==========================================
// INTERNAL — render one page to canvas
// ==========================================
async function renderPage(
  pageEl: HTMLElement,
  canvasScale: number,
): Promise<HTMLCanvasElement> {
  const wrapper = document.createElement('div')
  Object.assign(wrapper.style, {
    position: 'fixed',
    left:     '-9999px',
    top:      '0',
    width:    `${A3W_PX}px`,
    height:   `${A3H_PX}px`,
    overflow: 'hidden',
    background: 'white',
  })

  const clone = pageEl.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  Object.assign(clone.style, {
    transform:       `scale(${FIT})`,
    transformOrigin: 'top left',
    width:           `${PAGE_W}px`,
    height:          `${PAGE_H}px`,
  })

  wrapper.appendChild(clone)
  document.body.appendChild(wrapper)

  try {
    return await html2canvas(wrapper, {
      scale:     canvasScale,
      useCORS:   true,
      logging:   false,
      allowTaint: true,
      width:     A3W_PX,
      height:    A3H_PX,
    })
  } finally {
    document.body.removeChild(wrapper)
  }
}

// ==========================================
// PUBLIC
// ==========================================
export async function exportPDF(): Promise<void> {
  const ids   = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids
    .map(id => document.getElementById(id))
    .filter(Boolean) as HTMLElement[]

  if (!pages.length) throw new Error('CV pages not found')

  const MAX = 5 * 1024 * 1024   // 5 MB

  // Try decreasing quality until the file fits under 5 MB
  for (const { canvasScale, jpegQ } of [
    { canvasScale: 2,   jpegQ: 0.92 },
    { canvasScale: 2,   jpegQ: 0.78 },
    { canvasScale: 1.5, jpegQ: 0.70 },
  ]) {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit:        'mm',
      format:      'a3',
      compress:    true,
    })

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage('a3', 'landscape')
      const canvas = await renderPage(pages[i], canvasScale)
      const img    = canvas.toDataURL('image/jpeg', jpegQ)
      pdf.addImage(img, 'JPEG', 0, 0, A3W_MM, A3H_MM)
    }

    const blob = pdf.output('blob')
    if (blob.size <= MAX || jpegQ <= 0.70) {
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = 'AdedamolaMichael_CV.pdf'
      a.click()
      URL.revokeObjectURL(url)
      return
    }
  }
}

// ==========================================
// EXPORT FOR VERSIONS — returns a Blob
// ==========================================
export async function exportPDFBlob(): Promise<Blob> {
  const ids   = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids
    .map(id => document.getElementById(id))
    .filter(Boolean) as HTMLElement[]

  if (!pages.length) throw new Error('CV pages not found')

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3', compress: true })

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage('a3', 'landscape')
    const canvas = await renderPage(pages[i], 1.5)
    const img    = canvas.toDataURL('image/jpeg', 0.82)
    pdf.addImage(img, 'JPEG', 0, 0, A3W_MM, A3H_MM)
  }

  return pdf.output('blob')
}
