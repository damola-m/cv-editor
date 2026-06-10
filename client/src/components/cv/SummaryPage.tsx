/* ===================================
   SummaryPage.tsx
   -----------------------------------
   - Page 2: InDesign HTML rendered verbatim by default.
   - In modified mode: white rectangle blanks out ONLY the
     text column, then React text renders on top. GH diagrams,
     logos, and all other InDesign elements are untouched.
   - No CSS visibility hacks — those caused layout disruption.
   =================================== */
import htmlContent from '../../indesign/page2.html?raw'
import type { CVData } from '../../data/cv-data'
import { defaultCV } from '../../data/cv-data'

interface Props { data: CVData }

// InDesign positions (1191×842px space)
const X      = 69.307   // left edge of text column
const HEAD_Y = 38.614   // heading top
const BODY_Y = 61.291   // body text top
const BODY_W = 305.03   // column width
const BODY_H = 638.48   // body height

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
          Part 1 — InDesign HTML (always)
          Provides teal border, GH diagrams, logos, profile
          photo — everything except the summary text column.
          ============================= */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* =============================
          Part 2 — Modified overlay
          White rectangle covers only the text column so the
          original InDesign text disappears without touching
          any other element. React text renders on top.
          ============================= */}
      {modified && (
        <>
          {/* Blank out the text column */}
          <div style={{
            position: 'absolute',
            left:     X - 4,     // 4px before the text for a clean edge
            top:      30,        // below the teal top border
            width:    BODY_W + 8,
            height:   680,
            background: 'white',
            zIndex:   1,
          }} />

          {/* "Professional Summary" heading */}
          <div style={{
            position:   'absolute',
            left:       X,
            top:        HEAD_Y,
            width:      276.52,
            zIndex:     2,
            fontFamily: 'Calibri, sans-serif',
            fontSize:   14,
            fontWeight: 700,
            color:      '#1bb5b6',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>
            Professional Summary
          </div>

          {/* Body paragraphs */}
          <div style={{
            position:     'absolute',
            left:         X,
            top:          BODY_Y,
            width:        BODY_W,
            height:       BODY_H,
            overflow:     'hidden',
            zIndex:       2,
            fontFamily:   'Arial, sans-serif',
            fontSize:     10,
            lineHeight:   1.4,
            color:        '#000000',
            textAlign:    'justify',
            textAlignLast: 'left',
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
