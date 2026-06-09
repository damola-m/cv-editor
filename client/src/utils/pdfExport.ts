/* ===================================
   pdfExport.ts
   -----------------------------------
   - Uses window.print() so the browser renders a
     true vector PDF — text is selectable, not a
     raster image.
   - CSS @page forces A3 landscape (420 × 297 mm).
   - Each CV page is scaled by 1.333 to fill A3:
     1191px CSS = 315mm at 96dpi; 420/315 = 1.333.
   =================================== */

// Scale factor: fills A3 landscape with our 1191×842px InDesign pages.
// 420mm ÷ (1191px × 0.26458mm/px) = 420 ÷ 315.1 = 1.3325
const SCALE = (420 * 96) / (1191 * 25.4)   // ≈ 1.3325

export async function exportPDF(): Promise<void> {
  const ids = ['cv-page-1', 'cv-page-2', 'cv-page-3']
  const pages = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[]
  if (!pages.length) throw new Error('No CV pages found in DOM')

  // =============================
  // Part 1 — Build print container
  // Each .cv-pp wrapper is exactly A3 size in CSS mm.
  // The cloned .id-page inside is scaled to fill it.
  // =============================
  const container = document.createElement('div')
  container.id = '__cv_print__'

  pages.forEach((page, i) => {
    const wrapper = document.createElement('div')
    wrapper.className = 'cv-pp'
    if (i > 0) wrapper.classList.add('cv-pp-break')

    const clone = page.cloneNode(true) as HTMLElement
    clone.removeAttribute('id')   // avoid duplicate IDs in DOM
    clone.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      transform: scale(${SCALE});
      transform-origin: top left;
    `
    wrapper.appendChild(clone)
    container.appendChild(wrapper)
  })

  // =============================
  // Part 2 — Inject print CSS
  // Hides everything except the print container
  // and sets A3 page dimensions.
  // =============================
  const style = document.createElement('style')
  style.id = '__cv_print_style__'
  style.textContent = `
    @media print {
      @page {
        size: A3 landscape;
        margin: 0;
      }
      /* Hide the whole app */
      body > *:not(#__cv_print__) {
        display: none !important;
        visibility: hidden !important;
      }
      /* Show only the print container */
      #__cv_print__ {
        display: block !important;
        visibility: visible !important;
      }
      /* Each A3 page wrapper */
      .cv-pp {
        width: 420mm;
        height: 297mm;
        overflow: hidden;
        position: relative;
        background: white;
      }
      /* Page break before pages 2 and 3 */
      .cv-pp-break {
        break-before: page;
        page-break-before: always;
      }
    }
    /* Hidden on screen */
    #__cv_print__ {
      display: none;
      position: absolute;
      left: -99999px;
      top: 0;
    }
  `

  document.head.appendChild(style)
  document.body.appendChild(container)

  // =============================
  // Part 3 — Wait for fonts then print
  // =============================
  await document.fonts.ready

  await new Promise<void>(resolve => {
    const done = () => {
      // Clean up after the print dialog closes
      style.remove()
      container.remove()
      resolve()
    }
    window.addEventListener('afterprint', done, { once: true })
    window.print()
    // Fallback cleanup if afterprint never fires (some browsers)
    setTimeout(() => { style.remove(); container.remove(); resolve() }, 60_000)
  })
}
