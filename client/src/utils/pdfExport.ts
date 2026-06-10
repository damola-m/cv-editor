/* ===================================
   pdfExport.ts
   -----------------------------------
   exportPDF()   — direct .pdf download via jsPDF +
                   html2canvas. Text is rasterised (image
                   PDF) but downloads instantly.

   printPDF()    — browser print dialog. Vector text,
                   fully selectable. User picks "Save as
                   PDF" in the dialog.
   =================================== */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// InDesign native page dimensions
const PAGE_W = 1191
const PAGE_H = 842

// A3 landscape in mm
const A3W = 420
const A3H = 297

// Scale that maps 1191×842 CSS-px to A3 at 96 dpi
// 1191px @ 96dpi = 315mm.  420/315 = 1.3325
const PRINT_SCALE = (A3W * 96) / (PAGE_W * 25.4)  // ≈ 1.3325

// ==========================================
// INTERNAL — capture one page as canvas
// ==========================================
async function renderPage(
  el: HTMLElement,
  canvasScale: number,
): Promise<HTMLCanvasElement> {
  // Use position:absolute (NOT fixed — fixed clips to viewport).
  // visibility:hidden keeps it off-screen but html2canvas still
  // renders it; the content isn't cropped.
  const wrap = document.createElement('div')
  Object.assign(wrap.style, {
    position:      'absolute',
    left:          '0px',
    top:           '0px',
    width:         `${PAGE_W}px`,
    height:        `${PAGE_H}px`,
    overflow:      'hidden',
    background:    'white',
    zIndex:        '-9999',     // behind everything — user can't see it
    pointerEvents: 'none',      // can't interact with it
    // Do NOT set visibility:hidden or opacity:0 — html2canvas renders those as blank
  })

  const clone = el.cloneNode(true) as HTMLElement
  clone.removeAttribute('id')
  // Strip any viewport-scale transform applied by CVCanvas
  clone.style.transform       = 'none'
  clone.style.transformOrigin = ''
  clone.style.width           = `${PAGE_W}px`
  clone.style.height          = `${PAGE_H}px`

  wrap.appendChild(clone)
  document.body.appendChild(wrap)

  try {
    return await html2canvas(wrap, {
      scale:      canvasScale,
      useCORS:    true,
      logging:    false,
      allowTaint: true,
      width:      PAGE_W,
      height:     PAGE_H,
    })
  } finally {
    document.body.removeChild(wrap)
  }
}

// ==========================================
// exportPDF — raster PDF, direct download
// ==========================================
export async function exportPDF(): Promise<void> {
  const ids   = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
  if (!pages.length) throw new Error('CV pages not found')

  const MAX = 5 * 1024 * 1024

  for (const { cs, q } of [
    { cs: 2,   q: 0.92 },
    { cs: 2,   q: 0.78 },
    { cs: 1.5, q: 0.68 },
  ]) {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3', compress: true })

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage('a3', 'landscape')
      const canvas = await renderPage(pages[i], cs)
      // addImage stretches the canvas image to fill the full A3 page — no cropping
      pdf.addImage(canvas.toDataURL('image/jpeg', q), 'JPEG', 0, 0, A3W, A3H)
    }

    const blob = pdf.output('blob')
    if (blob.size <= MAX || q <= 0.68) {
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href = url; a.download = 'AdedamolaMichael_CV.pdf'; a.click()
      URL.revokeObjectURL(url)
      return
    }
  }
}

// ==========================================
// exportPDFBlob — for version downloads
// ==========================================
export async function exportPDFBlob(): Promise<Blob> {
  const ids   = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
  if (!pages.length) throw new Error('CV pages not found')

  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3', compress: true })
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage('a3', 'landscape')
    const canvas = await renderPage(pages[i], 1.5)
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.82), 'JPEG', 0, 0, A3W, A3H)
  }
  return pdf.output('blob')
}

// ==========================================
// printPDF — browser print → selectable text
// Uses CSS zoom so the InDesign pages fill A3
// in the browser's print engine (not rasterised).
// ==========================================
export function printPDF(): void {
  const ids   = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
  if (!pages.length) throw new Error('CV pages not found')

  // Build a hidden print container
  const root = document.createElement('div')
  root.id = '__cvprint__'

  pages.forEach((page, i) => {
    const wrapper = document.createElement('div')
    wrapper.className = '__cvpw__'
    if (i > 0) wrapper.classList.add('__cvpw__break')

    const clone = page.cloneNode(true) as HTMLElement
    clone.removeAttribute('id')
    // CSS zoom scales the layout box (unlike transform which only scales visually).
    // 1191px × 1.3325 = 1588px = 420mm at 96dpi → fills A3 landscape exactly.
    clone.style.cssText = `zoom:${PRINT_SCALE};width:${PAGE_W}px;height:${PAGE_H}px;`
    wrapper.appendChild(clone)
    root.appendChild(wrapper)
  })

  const style = document.createElement('style')
  style.id = '__cvprintstyle__'
  style.textContent = `
    @media print {
      @page { size: A3 landscape; margin: 0; }
      body > *:not(#__cvprint__) { display:none!important; visibility:hidden!important; }
      #__cvprint__ { display:block!important; visibility:visible!important; }
      .__cvpw__ {
        width: ${PAGE_W * PRINT_SCALE}px;
        height: ${PAGE_H * PRINT_SCALE}px;
        overflow: hidden;
        background: white;
        break-after: page;
        page-break-after: always;
      }
      .__cvpw__:last-child { break-after: avoid; page-break-after: avoid; }
    }
    #__cvprint__ { display:none; }
  `

  document.head.appendChild(style)
  document.body.appendChild(root)

  const cleanup = () => {
    style.remove()
    root.remove()
  }
  window.addEventListener('afterprint', cleanup, { once: true })
  setTimeout(cleanup, 60_000)   // fallback

  window.print()
}
