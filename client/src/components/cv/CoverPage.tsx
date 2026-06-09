/* ===================================
   CoverPage.tsx
   -----------------------------------
   - Renders InDesign HTML with contact values
     already baked into the HTML string via useMemo.
   - This avoids the dangerouslySetInnerHTML re-render
     problem where React resets innerHTML on every render
     cycle, overwriting post-mount DOM mutations.
   =================================== */
import { useMemo } from 'react'
import htmlContent from '../../indesign/page1.html?raw'
import type { CVData } from '../../data/cv-data'

interface Props {
  data: CVData
}

// InDesign span IDs that hold the editable contact values
const ID_ADDR  = '_idTextSpan011'   // "Seattle"
const ID_PHONE = '_idTextSpan014'   // phone number
const ID_EMAIL = '_idTextSpan017'   // email address

// Escape characters that are special inside HTML text nodes
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Replace the text content of a specific span by ID inside the HTML string.
// Regex pattern: (<span …id="ID"…>)(text)(</span>)
function patchSpan(html: string, id: string, value: string): string {
  const re = new RegExp(
    `(<span\\s[^>]*id="${id}"[^>]*>)[^<]*(</span>)`,
  )
  return html.replace(re, `$1${esc(value)}$2`)
}

export function CoverPage({ data }: Props) {
  const { address, phone, email } = data._static.contact

  // =============================
  // Build the HTML string with current contact values
  // baked in — no DOM mutation needed, survives every
  // re-render (React only resets innerHTML when the
  // __html string itself changes).
  // =============================
  const html = useMemo(() => {
    let h = htmlContent
    h = patchSpan(h, ID_ADDR,  address)
    h = patchSpan(h, ID_PHONE, phone)
    h = patchSpan(h, ID_EMAIL, email)
    return h
  }, [address, phone, email])

  return (
    <div
      className="id-page"
      id="cv-page-1"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
