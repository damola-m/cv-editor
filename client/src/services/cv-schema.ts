/* ===================================
   cv-schema.ts
   -----------------------------------
   - Builds a human-readable CV schema string
     injected into the AI system prompt so it
     understands every editable field and its path.
   =================================== */
import type { CVData } from '../data/cv-data'

export function buildCVContext(cv: CVData): string {
  const c = cv._static.contact
  const m = cv._static.military

  return `
== ADEDAMOLA MICHAEL — CURRENT CV CONTENT ==

CONTACT (cover page) — field paths: contact.address / contact.phone / contact.email
  Address : ${c.address}
  Phone   : ${c.phone}
  Email   : ${c.email}

PROFESSIONAL SUMMARY (page 2) — field path: summary
${cv.summary}

EMPLOYMENT HISTORY (page 3, 2-column layout)
${cv.experience.map(e => `
  [id: ${e.id}]
  Period   : ${e.period}   [experience.${e.id}.period]
  Role     : ${e.role}     [experience.${e.id}.role]
  Company  : ${e.company}  [experience.${e.id}.company]
  Location : ${e.location} [experience.${e.id}.location]
  Bullets  : (JSON array)  [experience.${e.id}.bullets]
${e.bullets.map(b => `    • ${b}`).join('\n')}
${e.keyProject ? `  Key Project: ${e.keyProject.name} [experience.${e.id}.keyProject.name]
  Key Project Bullets: (JSON array) [experience.${e.id}.keyProject.bullets]
${e.keyProject.bullets.map(b => `    • ${b}`).join('\n')}` : ''}`).join('\n---')}

EDUCATION (page 3, right column)
${cv.education.map((ed, i) => `  [index ${i}]
  Institution : ${ed.institution} [education.${i}.institution]
  Degree      : ${ed.degree}      [education.${i}.degree]
  Detail      : ${ed.detail ?? ''} [education.${i}.detail]`).join('\n')}

LICENCES & CERTIFICATIONS (page 3, right column) — field path: certifications (JSON array)
${cv.certifications.map((c, i) => `  ${i}. ${c}`).join('\n')}

AWARDS & PUBLICATIONS (page 3, right column) — field path: awards (JSON array)
${cv.awards.map((a, i) => `  ${i}. ${a}`).join('\n')}

MILITARY SERVICE (page 3, right column — static, do not edit unless asked)
  ${m.period} | ${m.role} | ${m.unit} | ${m.location}

== END OF CV CONTENT ==

FIELD PATH REFERENCE (for patches):
  summary                               → professional summary text
  experience.{id}.role                  → job title
  experience.{id}.company               → company name
  experience.{id}.period                → date range string
  experience.{id}.location              → location string
  experience.{id}.bullets               → JSON array of bullet strings
  experience.{id}.keyProject.name       → key project title
  experience.{id}.keyProject.bullets    → JSON array of key project bullets
  education.{index}.institution         → university / institution name
  education.{index}.degree              → degree / course title
  education.{index}.detail             → classification / detail
  certifications                        → JSON array of certification strings
  awards                                → JSON array of award strings
  contact.address                       → city shown on cover page
  contact.phone                         → phone shown on cover page
  contact.email                         → email shown on cover page
`
}
