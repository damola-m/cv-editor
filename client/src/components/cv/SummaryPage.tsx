/* ===================================
   SummaryPage.tsx
   -----------------------------------
   - Page 2: InDesign HTML rendered verbatim by default
     — pixel-perfect typography, exact line breaks.
   - React overlay activates ONLY when the AI has
     modified data.summary, using the same left-margin
     value (69.307px) for the top padding so all three
     sides are consistent.
   =================================== */
import htmlContent from '../../indesign/page2.html?raw'
import type { CVData } from '../../data/cv-data'
import { defaultCV } from '../../data/cv-data'

interface Props {
  data: CVData
}

// InDesign column geometry (1191×842px space)
const X      = 69.307   // left margin — matches InDesign
const BODY_W = 305.03   // _idContainer049 width
const BODY_H = 620       // trimmed slightly so body stays above footer

// When AI has modified the text we use these — top equals X so
// top / left / right margins all look consistent.
const HEAD_Y = X         // 69.307  (was 38.614 — too close to top)
const BODY_Y = HEAD_Y + 24  // heading (14px) + 10px gap

export function SummaryPage({ data }: Props) {
  const modified   = data.summary !== defaultCV.summary
  const paragraphs = data.summary.split('\n\n').filter(Boolean)

  return (
    <div
      className="id-page"
      id="cv-page-2"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
    >
      {/* =============================
          Part 1 — InDesign HTML (always present)
          Provides teal band, GH diagram, logos and —
          when unmodified — the original typeset text.
          ============================= */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* =============================
          Part 2 — AI-modified text overlay
          Only activated when summary differs from default.
          ============================= */}
      {modified && (
        <>
          <style>{`
            #_idContainer049 { visibility: hidden !important; }
            #_idContainer050 { visibility: hidden !important; }
          `}</style>

          {/* "Professional Summary" heading */}
          <div style={{
            position: 'absolute', left: X, top: HEAD_Y, width: 276.52,
            fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#1bb5b6', lineHeight: 1, whiteSpace: 'nowrap',
          }}>
            Professional Summary
          </div>

          {/* Body */}
          <div style={{
            position: 'absolute', left: X, top: BODY_Y,
            width: BODY_W, height: BODY_H, overflow: 'hidden',
            fontFamily: 'Arial, sans-serif', fontSize: 10, lineHeight: 1.4,
            color: '#000000', textAlign: 'justify', textAlignLast: 'left',
          }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ margin: 0, marginBottom: i < paragraphs.length - 1 ? 7 : 0 }}>
                {para}
              </p>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
