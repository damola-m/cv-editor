/* ===================================
   CoverPage.tsx
   -----------------------------------
   - Page 1: InDesign HTML rendered verbatim by default.
   - When address / phone / email differ from defaults,
     hides those InDesign containers and overlays React
     text at the exact same CSS positions.
   =================================== */
import htmlContent from '../../indesign/page1.html?raw'
import type { CVData } from '../../data/cv-data'
import { defaultCV } from '../../data/cv-data'

interface Props {
  data: CVData
}

// InDesign positions (1191×842 px space) for the contact row
// Labels row:   y=699
// Content row:  y=716.6
// Address col:  x=489.0   w=75.36
// Contact col:  x=601.2   w=118.64
// CharOverride-8: Calibri 9.6px #636466 (content text)
// CharOverride-6: Arial 9.6px bold #1bb5b6 (the "+" icon prefix)
const AX = 489.002;  const AY = 716.599;  const AW = 75.36
const CX = 601.187;  const CY = 716.571;  const CW = 118.64
const FONT_SIZE = 9.6

function ContactLine({ value }: { value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 3.5, lineHeight: 1.35 }}>
      <span style={{
        fontFamily: 'Arial, sans-serif', fontSize: FONT_SIZE,
        fontWeight: 700, color: '#1bb5b6', flexShrink: 0, marginTop: 0.5,
      }}>+</span>
      <span style={{
        fontFamily: 'Calibri, sans-serif', fontSize: FONT_SIZE,
        color: '#636466', wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}

export function CoverPage({ data }: Props) {
  const c = data._static.contact
  const d = defaultCV._static.contact

  const addrChanged    = c.address !== d.address
  const contactChanged = c.phone   !== d.phone || c.email !== d.email
  const anyChanged     = addrChanged || contactChanged

  return (
    <div
      className="id-page"
      id="cv-page-1"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
    >
      {/* =============================
          Part 1 — InDesign HTML (always present)
          Provides the full cover illustration, logos,
          QR code, Curriculum Vitae block, and all contact
          labels/icons when contact info is unmodified.
          ============================= */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* =============================
          Part 2 — Contact overlay (only when values changed)
          ============================= */}
      {anyChanged && (
        <>
          <style>{`
            #_idContainer038 { visibility: hidden !important; }
            #_idContainer039 { visibility: hidden !important; }
          `}</style>

          {/* Address value — same position as _idContainer038 */}
          {addrChanged && (
            <div style={{
              position: 'absolute', left: AX, top: AY, width: AW, overflow: 'hidden',
            }}>
              <ContactLine value={c.address} />
            </div>
          )}

          {/* Phone + email — same position as _idContainer039 */}
          {contactChanged && (
            <div style={{
              position: 'absolute', left: CX, top: CY, width: CW, overflow: 'hidden',
            }}>
              <ContactLine value={c.phone} />
              <ContactLine value={c.email} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
