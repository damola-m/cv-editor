/* ===================================
   ExperiencePage.tsx
   -----------------------------------
   - Page 3: InDesign HTML always rendered (preserves
     logos, skill icons, timeline markers, borders).
   - In modified mode: specific job containers are hidden
     via CSS display:none, then replaced with React divs
     at the EXACT SAME InDesign y-coordinates.
   - Each entry is placed absolutely — no CSS columns —
     so the layout structure is always identical to the
     InDesign original regardless of content changes.
   =================================== */
import htmlContent from '../../indesign/page3.html?raw'
import type { CVData, ExperienceEntry } from '../../data/cv-data'
import { defaultCV } from '../../data/cv-data'

interface Props { data: CVData }

// ==========================================
// INDESIGN POSITION MAP
// Maps each experience entry ID to its exact InDesign
// container position (1191×842px space).
// Left col x=69.332, middle col x=430.741
// ==========================================
const LEFT_X  = 69.332
const MID_X   = 430.741
const RIGHT_X = 800.629

// entry id → {header container id, body container id, absolute y positions}
const EXP_POS: Record<string, {
  hId: string; hY: number; hH: number;
  bId: string; bY: number; bH: number;
  x: number;
}> = {
  cannon:       { hId: '_idContainer183', hY: 82,    hH: 53.04, bId: '_idContainer120', bY: 113.743, bH: 188.80, x: LEFT_X },
  'pe-seattle': { hId: '_idContainer181', hY: 294,   hH: 40.04, bId: '_idContainer121', bY: 345.603, bH: 172.54, x: LEFT_X },
  'pe-vancouver':{ hId: '_idContainer179',hY: 501.9, hH: 53.04, bId: '_idContainer187', bY: 533.5,   bH: 183.54, x: LEFT_X },
  benoy:        { hId: '_idContainer182', hY: 82,    hH: 53.04, bId: '_idContainer122', bY: 113.743, bH: 142.04, x: MID_X  },
  noissa:       { hId: '_idContainer184', hY: 240,   hH: 53.04, bId: '_idContainer123', bY: 271.708, bH: 125.04, x: MID_X  },
  snug:         { hId: '_idContainer178', hY: 381.9, hH: 53.04, bId: '_idContainer186', bY: 413.535, bH: 145.04, x: MID_X  },
  codemasters:  { hId: '_idContainer180', hY: 542.6, hH: 53.04, bId: '_idContainer188', bY: 574.2,   bH: 145.04, x: MID_X  },
}

// ==========================================
// HIDE SELECTORS  — all employment + right-col text containers
// ==========================================
const HIDE = `
  /* Employment headers + bodies */
  #_idContainer183,#_idContainer120,
  #_idContainer181,#_idContainer121,
  #_idContainer179,#_idContainer187,
  #_idContainer182,#_idContainer122,
  #_idContainer184,#_idContainer123,
  #_idContainer178,#_idContainer186,
  #_idContainer180,#_idContainer188,
  /* Employment section heading */
  #_idContainer131,
  /* Curriculum Vitae header */
  #_idContainer185,
  /* Right col headings + content */
  #_idContainer126,#_idContainer127,#_idContainer125,#_idContainer124,
  #_idContainer128,#_idContainer129,
  #_idContainer237,#_idContainer238,#_idContainer239,#_idContainer240,
  #_idContainer241,#_idContainer242,#_idContainer243,#_idContainer244,
  #_idContainer245,#_idContainer246,#_idContainer255
  { display: none !important; }
`

// ==========================================
// SUB-COMPONENTS
// ==========================================

function JobHeader({ exp, pos }: { exp: ExperienceEntry; pos: typeof EXP_POS[string] }) {
  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.hY,
      width: 318.85, height: pos.hH, overflow: 'hidden',
    }}>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, color: '#636466', lineHeight: 1.25 }}>
        {exp.period}
      </div>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#636466', lineHeight: 1.2 }}>
        {exp.role}
      </div>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#1bb5b6', lineHeight: 1.2 }}>
        {exp.company} | {exp.location}
      </div>
    </div>
  )
}

function JobBody({ exp, pos }: { exp: ExperienceEntry; pos: typeof EXP_POS[string] }) {
  return (
    <div style={{
      position: 'absolute', left: pos.x, top: pos.bY,
      width: 318.85, height: pos.bH, overflow: 'hidden',
      fontFamily: 'Arial, sans-serif', fontSize: 9, lineHeight: 1.3, color: '#000',
    }}>
      {exp.keyProject && (
        <div style={{ fontStyle: 'italic', marginBottom: 2 }}>
          Key Project: {exp.keyProject.name}
        </div>
      )}
      {exp.bullets.slice(0, 4).map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 3, marginBottom: 1.5 }}>
          <span style={{ color: '#1bb5b6', flexShrink: 0 }}>•</span>
          <span>{b}</span>
        </div>
      ))}
      {exp.keyProject && exp.keyProject.bullets.slice(0, 2).map((b, i) => (
        <div key={i} style={{ display: 'flex', gap: 3, marginBottom: 1.5 }}>
          <span style={{ color: '#1bb5b6', flexShrink: 0 }}>•</span>
          <span>{b}</span>
        </div>
      ))}
    </div>
  )
}

function SideHeading({ children }: { children: string }) {
  return (
    <div style={{ fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700, color: '#1bb5b6', lineHeight: 1.1, marginBottom: 4 }}>
      {children}
    </div>
  )
}

function SideEntry({ label, detail }: { label: string; detail?: string }) {
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700, color: '#636466', lineHeight: 1.25 }}>{label}</div>
      {detail && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9, color: '#000', lineHeight: 1.25 }}>{detail}</div>}
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ExperiencePage({ data }: Props) {
  const { military } = data._static

  const modified =
    JSON.stringify(data.experience)     !== JSON.stringify(defaultCV.experience)    ||
    JSON.stringify(data.education)      !== JSON.stringify(defaultCV.education)     ||
    JSON.stringify(data.certifications) !== JSON.stringify(defaultCV.certifications)||
    JSON.stringify(data.awards)         !== JSON.stringify(defaultCV.awards)

  // Build a lookup by entry id
  const expById: Record<string, ExperienceEntry> = {}
  data.experience.forEach(e => { expById[e.id] = e })

  return (
    <div
      className="id-page"
      id="cv-page-3"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
    >
      {/* =============================
          Part 1 — InDesign HTML (always)
          Logos, skill icons, timeline markers, decorative
          borders — all the static chrome remains untouched.
          ============================= */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* =============================
          Part 2 — AI-modified overlay
          Only shown when data changed from default.
          Hides InDesign text containers with display:none
          (not visibility:hidden — no layout side-effects).
          ============================= */}
      {modified && (
        <>
          <style>{HIDE}</style>

          {/* "Curriculum Vitae" header */}
          <div style={{
            position: 'absolute', left: 69.307, top: 32.046,
            fontFamily: 'Calibri, sans-serif', fontSize: 18, fontWeight: 700,
            color: '#000', letterSpacing: 0.5,
          }}>
            Curriculum Vitae
          </div>

          {/* "Employment History" heading */}
          <div style={{
            position: 'absolute', left: 69.332, top: 61.291, width: 318.85,
            fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#1bb5b6',
          }}>
            Employment History
          </div>

          {/* =============================
              Employment entries — each at its exact
              InDesign y-coordinate (no CSS columns)
              ============================= */}
          {Object.entries(EXP_POS).map(([id, pos]) => {
            const exp = expById[id]
            if (!exp) return null
            return (
              <div key={id}>
                <JobHeader exp={exp} pos={pos} />
                <JobBody   exp={exp} pos={pos} />
              </div>
            )
          })}

          {/* =============================
              Right sidebar — natural flow (Education, Licences,
              Military, Awards) starting at InDesign's Education y.
              ============================= */}
          <div style={{
            position: 'absolute', left: RIGHT_X, top: 61.292,
            width: 319, height: 680, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ marginBottom: 8 }}>
              <SideHeading>Education</SideHeading>
              {data.education.map((ed, i) => (
                <SideEntry key={i} label={ed.institution} detail={`${ed.degree}${ed.detail ? ` | ${ed.detail}` : ''}`} />
              ))}
            </div>

            <div style={{ marginBottom: 8 }}>
              <SideHeading>Licences &amp; Certifications</SideHeading>
              {data.certifications.map((cert, i) => {
                const [org, ...rest] = cert.split(' — ')
                return <SideEntry key={i} label={org} detail={rest.join(' — ')} />
              })}
            </div>

            <div style={{ marginBottom: 8 }}>
              <SideHeading>Military Service</SideHeading>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, color: '#636466', lineHeight: 1.3 }}>{military.period}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#636466', lineHeight: 1.2 }}>{military.role}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#1bb5b6', lineHeight: 1.2 }}>{military.unit} | {military.location}</div>
            </div>

            <div>
              <SideHeading>Awards &amp; Publications</SideHeading>
              {data.awards.map((award, i) => (
                <div key={i} style={{ display: 'flex', gap: 4, fontFamily: 'Arial, sans-serif', fontSize: 9, lineHeight: 1.3, color: '#000', marginBottom: 2 }}>
                  <span style={{ color: '#1bb5b6', flexShrink: 0 }}>•</span>
                  <span>{award}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
