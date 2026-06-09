/* ===================================
   CVCanvas.tsx
   -----------------------------------
   - Scrollable viewport. Scales each A3 page to
     fit entirely within the screen (no cropping).
   - Scale uses min(fitWidth, fitHeight) so the full
     page is always visible. PDF export uses true dims.
   =================================== */
import { useEffect, useRef, useState } from 'react'
import type { CVData } from '../data/cv-data'
import { CoverPage } from './cv/CoverPage'
import { SummaryPage } from './cv/SummaryPage'
import { ExperiencePage } from './cv/ExperiencePage'

const CV_W = 1191  // A3 landscape — InDesign native export at 72 dpi
const CV_H = 842
const PAGE_GAP = 16   // px between pages when scrolling

interface Props {
  data: CVData
}

export function CVCanvas({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)

  // =============================
  // Part 1 — Fit-to-screen scale
  // Constrains by both width AND height so the full
  // A3 page is always visible without scrolling within it.
  // =============================
  useEffect(() => {
    function recalc() {
      const el = containerRef.current
      if (!el) return
      const margin = 24
      const fitW = (el.clientWidth  - margin * 2) / CV_W
      const fitH = (el.clientHeight - margin * 2) / CV_H
      setScale(Math.max(0.15, Math.min(fitW, fitH)))
    }
    recalc()
    // ResizeObserver fires when the sidebar animates open/closed —
    // window.resize does not catch that layout change.
    const ro = new ResizeObserver(recalc)
    if (containerRef.current) ro.observe(containerRef.current)
    window.addEventListener('resize', recalc)
    return () => { ro.disconnect(); window.removeEventListener('resize', recalc) }
  }, [])

  const scaledW = Math.round(CV_W * scale)
  const scaledH = Math.round(CV_H * scale)

  const pages = [
    <CoverPage key="cover" data={data} />,
    <SummaryPage key="summary" data={data} />,
    <ExperiencePage key="experience" data={data} />,
  ]

  return (
    <div
      ref={containerRef}
      className="cv-canvas-scroll"
      style={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        overflowX: 'hidden',
        background: '#555',
      }}
    >
      {/* Spacer so first page starts centered vertically if shorter than viewport */}
      <div style={{ height: PAGE_GAP }} />

      {pages.map((page, i) => (
        <div
          key={i}
          style={{
            width: scaledW,
            height: scaledH,
            margin: `0 auto ${PAGE_GAP}px`,
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: '0 4px 28px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: CV_W,
            height: CV_H,
          }}>
            {page}
          </div>
        </div>
      ))}

      <div style={{ height: PAGE_GAP }} />
    </div>
  )
}
