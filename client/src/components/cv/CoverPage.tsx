/* ===================================
   CoverPage.tsx
   -----------------------------------
   - Renders InDesign HTML verbatim.
   - Uses useEffect to directly update only the
     text nodes for address / phone / email — the
     InDesign layout, fonts, and icons are untouched.
   - Also fixes the portfolio link to damola.ca.
   =================================== */
import { useEffect } from 'react'
import htmlContent from '../../indesign/page1.html?raw'
import type { CVData } from '../../data/cv-data'

interface Props {
  data: CVData
}

// InDesign span IDs that hold the editable contact values.
// These come from the original InDesign HTML export.
const SPAN_ADDRESS = '_idTextSpan011'  // "Seattle"
const SPAN_PHONE   = '_idTextSpan014'  // phone number
const SPAN_EMAIL   = '_idTextSpan017'  // email address

export function CoverPage({ data }: Props) {
  const { address, phone, email } = data._static.contact

  // =============================
  // Part 1 — Live-update contact text spans
  // Direct DOM mutation preserves 100% of InDesign's
  // typography, layout, and icon styling.
  // =============================
  useEffect(() => {
    const root = document.getElementById('cv-page-1')
    if (!root) return

    const setText = (id: string, value: string) => {
      const el = root.querySelector(`#${id}`)
      if (el) el.textContent = value
    }

    setText(SPAN_ADDRESS, address)
    setText(SPAN_PHONE,   phone)
    setText(SPAN_EMAIL,   email)
  }, [address, phone, email])

  // =============================
  // Part 2 — Fix portfolio link
  // InDesign exported the link as an old Google Drive URL.
  // Update it to the real portfolio site.
  // =============================
  useEffect(() => {
    const root = document.getElementById('cv-page-1')
    if (!root) return
    root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a => {
      if (a.href.includes('damola.ca') || a.href.includes('drive.google.com')) {
        a.href   = 'https://www.damola.ca/'
        a.target = '_blank'
        a.rel    = 'noopener noreferrer'
      }
    })
  }, [])   // runs once after mount

  return (
    <div
      className="id-page"
      id="cv-page-1"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  )
}
