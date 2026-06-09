/* ===================================
   useCVState.ts
   -----------------------------------
   - CV data state with full localStorage persistence.
   - AI changes, contact edits, and any other field
     updates are auto-saved so they survive page refresh.
   - Provides resetToDefault to wipe all changes.
   =================================== */
import { useState, useCallback, useEffect } from 'react'
import { defaultCV, type CVData } from '../data/cv-data'

export type FieldPatch = { field: string; newValue: string }

// ==========================================
// STORAGE
// ==========================================
const CV_KEY      = 'cv_state'
const CONTACT_KEY = 'cv_contact'

function loadCV(): CVData {
  // Try full saved state first
  try {
    const raw = localStorage.getItem(CV_KEY)
    if (raw) return JSON.parse(raw) as CVData
  } catch { /* ignore */ }

  // Fall back to contact-only persistence (legacy)
  try {
    const contact = localStorage.getItem(CONTACT_KEY)
    if (contact) {
      return {
        ...defaultCV,
        _static: {
          ...defaultCV._static,
          contact: { ...defaultCV._static.contact, ...JSON.parse(contact) },
        },
      }
    }
  } catch { /* ignore */ }

  return defaultCV
}

// ==========================================
// PATCH APPLIER
// ==========================================
function applyFieldPatch(prev: CVData, patch: FieldPatch): CVData {
  const parts = patch.field.split('.')

  if (parts[0] === 'summary' && parts.length === 1)
    return { ...prev, summary: patch.newValue }

  if (parts[0] === 'contact' && parts.length === 2) {
    const f = parts[1] as keyof CVData['_static']['contact']
    return { ...prev, _static: { ...prev._static, contact: { ...prev._static.contact, [f]: patch.newValue } } }
  }

  if (parts[0] === 'experience' && parts.length >= 3) {
    const id    = parts[1]
    const field = parts.slice(2).join('.')
    const idx   = prev.experience.findIndex(e => e.id === id)
    if (idx < 0) return prev
    const entry = { ...prev.experience[idx] }
    if (field === 'role')     entry.role     = patch.newValue
    if (field === 'company')  entry.company  = patch.newValue
    if (field === 'period')   entry.period   = patch.newValue
    if (field === 'location') entry.location = patch.newValue
    if (field === 'bullets')  { try { entry.bullets = JSON.parse(patch.newValue) } catch { /* */ } }
    if (field === 'keyProject.name' && entry.keyProject)
      entry.keyProject = { ...entry.keyProject, name: patch.newValue }
    if (field === 'keyProject.bullets' && entry.keyProject)
      { try { entry.keyProject = { ...entry.keyProject, bullets: JSON.parse(patch.newValue) } } catch { /* */ } }
    const exp = [...prev.experience]; exp[idx] = entry
    return { ...prev, experience: exp }
  }

  if (parts[0] === 'education' && parts.length >= 3) {
    const idx   = parseInt(parts[1], 10)
    if (isNaN(idx) || idx >= prev.education.length) return prev
    const field = parts.slice(2).join('.')
    const entry = { ...prev.education[idx] }
    if (field === 'institution') entry.institution = patch.newValue
    if (field === 'degree')      entry.degree      = patch.newValue
    if (field === 'detail')      entry.detail      = patch.newValue || undefined
    const edu = [...prev.education]; edu[idx] = entry
    return { ...prev, education: edu }
  }

  if (parts[0] === 'certifications' && parts.length === 1)
    { try { return { ...prev, certifications: JSON.parse(patch.newValue) } } catch { return prev } }

  if (parts[0] === 'awards' && parts.length === 1)
    { try { return { ...prev, awards: JSON.parse(patch.newValue) } } catch { return prev } }

  return prev
}

// ==========================================
// HOOK
// ==========================================
export function useCVState() {
  const [cv, setCV] = useState<CVData>(loadCV)

  // =============================
  // Part 1 — Auto-save on every change
  // =============================
  useEffect(() => {
    localStorage.setItem(CV_KEY, JSON.stringify(cv))
  }, [cv])

  // =============================
  // Part 2 — AI patches
  // =============================
  const applyPatch = useCallback((patch: FieldPatch) => {
    setCV(prev => applyFieldPatch(prev, patch))
  }, [])

  const rejectPatch  = useCallback((_: string) => { /* handled in Sidebar */ }, [])
  const queuePatches = useCallback((_: FieldPatch[]) => { /* handled in Sidebar */ }, [])

  // =============================
  // Part 3 — Contact live edits
  // =============================
  const updateContact = useCallback(
    (field: 'address' | 'phone' | 'email', value: string) => {
      setCV(prev => ({
        ...prev,
        _static: { ...prev._static, contact: { ...prev._static.contact, [field]: value } },
      }))
    }, [],
  )

  // =============================
  // Part 4 — Persist settings (contact + API key)
  // =============================
  const persistSettings = useCallback(
    (contact: CVData['_static']['contact'], apiKey: string) => {
      localStorage.setItem(CONTACT_KEY, JSON.stringify(contact))
      localStorage.setItem('gemini_api_key', apiKey)
      // cv_state will auto-save via the useEffect above
    }, [],
  )

  // =============================
  // Part 5 — Reset to default
  // =============================
  const resetToDefault = useCallback(() => {
    localStorage.removeItem(CV_KEY)
    localStorage.removeItem(CONTACT_KEY)
    setCV(defaultCV)
  }, [])

  // =============================
  // Part 6 — Load a saved version
  // =============================
  const loadVersion = useCallback((cvData: CVData) => {
    setCV(cvData)
  }, [])

  return {
    cv, setCV,
    applyPatch, rejectPatch, queuePatches,
    updateContact, persistSettings,
    resetToDefault, loadVersion,
    pending: [] as FieldPatch[],
  }
}
