/* ===================================
   pdfExport.ts
   -----------------------------------
   - Exports the 3 CV pages to a single A3 PDF.
   - Tries progressive quality reduction to stay under 5MB.
   =================================== */

// html2pdf.js doesn't have official types — declare minimal shape
declare const html2pdf: {
  (): {
    from: (el: HTMLElement) => {
      set: (opts: object) => {
        toPdf: () => {
          get: (key: string) => Promise<{ save: (name: string) => void; output: (type: string) => string }>
        }
      }
    }
  }
}

const MAX_BYTES = 5 * 1024 * 1024 // 5MB

function buildOptions(quality: number) {
  return {
    margin: 0,
    filename: 'AdedamolaMichael_CV.pdf',
    image: { type: 'jpeg', quality },
    html2canvas: {
      scale: 3,          // 3× render ≈ 216 dpi on A3 — good print quality
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a3',
      orientation: 'landscape',
      compress: true,
    },
    pagebreak: { mode: 'avoid-all', before: '#cv-page-2, #cv-page-3' },
  }
}

export async function exportPDF(): Promise<void> {
  const pages = ['cv-page-1', 'cv-page-2', 'cv-page-3']
    .map(id => document.getElementById(id))
    .filter(Boolean) as HTMLElement[]

  if (pages.length === 0) throw new Error('No CV pages found in DOM')

  // Wrap all pages in a temporary container at true InDesign dimensions
  const container = document.createElement('div')
  container.style.width = '1191px'
  container.style.background = 'white'
  pages.forEach(p => {
    const clone = p.cloneNode(true) as HTMLElement
    // Reset scale transform for export — we want true dimensions
    clone.style.transform = 'none'
    clone.style.marginBottom = '0'
    container.appendChild(clone)
  })
  document.body.appendChild(container)

  const qualities = [0.95, 0.82, 0.68]
  let lastDataUrl = ''

  try {
    for (const quality of qualities) {
      const worker = html2pdf()
        .from(container)
        .set(buildOptions(quality))
        .toPdf()

      const pdfObj = await worker.get('pdf')
      const dataUrl: string = (pdfObj as unknown as { output: (t: string) => string }).output('datauristring')
      const bytes = Math.round((dataUrl.length - dataUrl.indexOf(',') - 1) * 0.75)

      lastDataUrl = dataUrl
      if (bytes <= MAX_BYTES) break
    }

    // Trigger download
    const link = document.createElement('a')
    link.href = lastDataUrl
    link.download = 'AdedamolaMichael_CV.pdf'
    link.click()
  } finally {
    document.body.removeChild(container)
  }
}
