/* ===================================
   ExperiencePage.tsx
   -----------------------------------
   - Page 3: renders InDesign HTML for logos/decorations.
   - Hides all text containers via CSS.
   - Overlays React text at InDesign pixel positions.
   - 3-column layout: left employment | mid employment | right sidebar.
   =================================== */
import htmlContent from '../../indesign/page3.html?raw'
import type { CVData, ExperienceEntry } from '../../data/cv-data'
import { defaultCV } from '../../data/cv-data'

interface Props {
  data: CVData
}

// ==========================================
// INDESIGN POSITIONS (1191×842px space)
// ==========================================
// Left col:   x=69.3,   w=318.85
// Middle col: x=430.7,  w=318.85, gap from left=42px
// Right col:  x=800.6,  w=319
// CV header:  y=32.0
// Emp heading: y=61.3
// Col content starts: y=82
// Right col sections (absolute y from page top):
//   Education:  y=61.3  (heading)
//   Licences:   y=233.9 (heading)
//   Military:   y=495.0 (heading)
//   Awards:     y=550.5 (heading)
// Footer logos start: y≈740

const HIDE = `
  #_idContainer185,#_idContainer131,
  #_idContainer183,#_idContainer120,#_idContainer181,#_idContainer121,
  #_idContainer179,#_idContainer187,
  #_idContainer182,#_idContainer122,#_idContainer184,#_idContainer123,
  #_idContainer178,#_idContainer186,#_idContainer180,#_idContainer188,
  #_idContainer126,#_idContainer127,#_idContainer125,#_idContainer124,
  #_idContainer128,#_idContainer129,
  #_idContainer237,#_idContainer238,#_idContainer239,#_idContainer240,
  #_idContainer241,#_idContainer242,#_idContainer243,#_idContainer244,
  #_idContainer245,#_idContainer246,#_idContainer255
  { visibility: hidden !important; }
`

// ==========================================
// SUB-COMPONENTS
// ==========================================

function JobBlock({ job }: { job: ExperienceEntry }) {
  return (
    <div style={{ marginBottom: 6, breakInside: 'avoid' }}>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 9.5,
        color: '#636466', lineHeight: 1.3,
      }}>
        {job.period}
      </div>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700,
        color: '#636466', lineHeight: 1.2,
      }}>
        {job.role}
      </div>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700,
        color: '#1bb5b6', lineHeight: 1.2, marginBottom: 2,
      }}>
        {job.company} | {job.location}
      </div>
      {job.keyProject && (
        <div style={{
          fontFamily: 'Arial, sans-serif', fontSize: 9, fontStyle: 'italic',
          color: '#000', lineHeight: 1.3, marginBottom: 1,
        }}>
          Key Project: {job.keyProject.name}
        </div>
      )}
      {job.bullets.slice(0, 3).map((b, i) => (
        <div key={i} style={{
          display: 'flex', gap: 3, lineHeight: 1.3,
          fontFamily: 'Arial, sans-serif', fontSize: 9,
        }}>
          <span style={{ color: '#1bb5b6', flexShrink: 0 }}>•</span>
          <span style={{ color: '#000' }}>{b}</span>
        </div>
      ))}
      {job.keyProject && job.keyProject.bullets.slice(0, 2).map((b, i) => (
        <div key={i} style={{
          display: 'flex', gap: 3, lineHeight: 1.3,
          fontFamily: 'Arial, sans-serif', fontSize: 9,
        }}>
          <span style={{ color: '#1bb5b6', flexShrink: 0 }}>•</span>
          <span style={{ color: '#000' }}>{b}</span>
        </div>
      ))}
    </div>
  )
}

function SideHeading({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700,
      color: '#1bb5b6', lineHeight: 1.1, marginBottom: 4,
    }}>
      {children}
    </div>
  )
}

function SideEntry({ label, detail }: { label: string; detail?: string }) {
  return (
    <div style={{ marginBottom: 3 }}>
      <div style={{
        fontFamily: 'Arial, sans-serif', fontSize: 9, fontWeight: 700,
        color: '#636466', lineHeight: 1.25,
      }}>
        {label}
      </div>
      {detail && (
        <div style={{
          fontFamily: 'Arial, sans-serif', fontSize: 9,
          color: '#000', lineHeight: 1.25,
        }}>
          {detail}
        </div>
      )}
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function ExperiencePage({ data }: Props) {
  const { military } = data._static

  // =============================
  // Part 1 — Modified-state detection
  // InDesign HTML is shown verbatim when unmodified.
  // React overlay activates only when the AI has changed data.
  // =============================
  const modified =
    JSON.stringify(data.experience)    !== JSON.stringify(defaultCV.experience)    ||
    JSON.stringify(data.education)     !== JSON.stringify(defaultCV.education)     ||
    JSON.stringify(data.certifications) !== JSON.stringify(defaultCV.certifications) ||
    JSON.stringify(data.awards)        !== JSON.stringify(defaultCV.awards)

  // Layout constants — when modified, top matches the left margin (69.307)
  // so all three sides have consistent padding.
  const X      = 69.307
  const RX     = 800.629
  const CV_Y   = X            // "Curriculum Vitae" header — equal to left margin
  const EMP_Y  = CV_Y + 28   // below CV header (18px font + 10px gap)
  const CONT_Y = EMP_Y + 22  // below Employment heading (14px + 8px gap)
  const EDU_Y  = CV_Y + 8    // right col starts a few px below CV header

  return (
    <div
      className="id-page"
      id="cv-page-3"
      style={{ width: 1191, height: 842, position: 'relative', overflow: 'hidden' }}
    >
      {/* =============================
          Part 2 — InDesign HTML (always present)
          Renders logos, skill icons, decorative marks and —
          when unmodified — the original typeset text.
          ============================= */}
      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

      {/* =============================
          Part 3 — AI-modified overlay
          White blanks + React text, only when data changed.
          ============================= */}
      {modified && (
        <>
          <style>{HIDE}</style>

          {/* White blanks over InDesign text areas */}
          <div style={{ position: 'absolute', left: X, top: 28, width: 681, height: 706, background: 'white' }} />
          <div style={{ position: 'absolute', left: RX, top: 28, width: 320, height: 706, background: 'white' }} />

          {/* "Curriculum Vitae" header */}
          <div style={{
            position: 'absolute', left: X, top: CV_Y,
            fontFamily: 'Calibri, sans-serif', fontSize: 18, fontWeight: 700,
            color: '#000', letterSpacing: 0.5,
          }}>
            Curriculum Vitae
          </div>

          {/* Employment History heading + 2-column entries */}
          <div style={{ position: 'absolute', left: X, top: EMP_Y, width: 680 }}>
            <div style={{
              fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700,
              color: '#1bb5b6', marginBottom: 6,
            }}>
              Employment History
            </div>
            <div style={{
              columnCount: 2, columnGap: 43, columnWidth: 318,
              columnFill: 'auto', height: 842 - CONT_Y - 80, overflow: 'hidden',
            }}>
              {data.experience.map(job => (
                <JobBlock key={job.id} job={job} />
              ))}
            </div>
          </div>

          {/* Right sidebar — natural flow, no fixed y per section */}
          <div style={{
            position: 'absolute', left: RX, top: EDU_Y,
            width: 319, height: 740 - EDU_Y, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ marginBottom: 8 }}>
              <SideHeading>Education</SideHeading>
              {data.education.map((ed, i) => (
                <SideEntry
                  key={i}
                  label={ed.institution}
                  detail={`${ed.degree}${ed.detail ? ` | ${ed.detail}` : ''}`}
                />
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
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, color: '#636466', lineHeight: 1.3 }}>
                {military.period}
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#636466', lineHeight: 1.2 }}>
                {military.role}
              </div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 9.5, fontWeight: 700, color: '#1bb5b6', lineHeight: 1.2 }}>
                {military.unit} | {military.location}
              </div>
            </div>

            <div>
              <SideHeading>Awards &amp; Publications</SideHeading>
              {data.awards.map((award, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 4,
                  fontFamily: 'Arial, sans-serif', fontSize: 9, lineHeight: 1.3,
                  color: '#000', marginBottom: 2,
                }}>
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
