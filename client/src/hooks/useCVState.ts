/* ===================================
   useCVState.ts
   -----------------------------------
   - CV data state, localStorage persistence,
     AI patch apply/reject, contact live edits.
   =================================== */
import { useState, useCallback } from 'react'
import { defaultCV, type CVData } from '../data/cv-data'

export type FieldPatch = { field: string; newValue: string }

// ==========================================
// STORAGE HELPERS
// ==========================================

const CONTACT_KEY = 'cv_contact'

function loadStoredContact(): Partial<CVData['_static']['contact']> {
  try {
    const raw = localStorage.getItem(CONTACT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveContactToStorage(contact: CVData['_static']['contact']) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(contact))
}

// ==========================================
// INITIAL STATE — hydrated from localStorage
// ==========================================

function makeInitialCV(): CVData {
  const stored = loadStoredContact()
  return {
    ...defaultCV,
    _static: {
      ...defaultCV._static,
      contact: { ...defaultCV._static.contact, ...stored },
    },
  }
}

// ==========================================
// PATCH APPLIER — handles all field paths
// ==========================================

function applyFieldPatch(prev: CVData, patch: FieldPatch): CVData {
  const parts = patch.field.split('.')

  // ── summary ────────────────────────────
  if (parts[0] === 'summary' && parts.length === 1) {
    return { ...prev, summary: patch.newValue }
  }

  // ── contact.{field} ─────────────────────
  if (parts[0] === 'contact' && parts.length === 2) {
    const f = parts[1] as keyof CVData['_static']['contact']
    return {
      ...prev,
      _static: {
        ...prev._static,
        contact: { ...prev._static.contact, [f]: patch.newValue },
      },
    }
  }

  // ── experience.{id}.{field} ─────────────
  if (parts[0] === 'experience' && parts.length >= 3) {
    const id   = parts[1]
    const field = parts.slice(2).join('.')
    const idx  = prev.experience.findIndex(e => e.id === id)
    if (idx < 0) return prev
    const entry = { ...prev.experience[idx] }

    if (field === 'role')     entry.role     = patch.newValue
    if (field === 'company')  entry.company  = patch.newValue
    if (field === 'period')   entry.period   = patch.newValue
    if (field === 'location') entry.location = patch.newValue
    if (field === 'bullets') {
      try { entry.bullets = JSON.parse(patch.newValue) } catch { /* keep */ }
    }
    if (field === 'keyProject.name' && entry.keyProject) {
      entry.keyProject = { ...entry.keyProject, name: patch.newValue }
    }
    if (field === 'keyProject.bullets' && entry.keyProject) {
      try { entry.keyProject = { ...entry.keyProject, bullets: JSON.parse(patch.newValue) } } catch { /* keep */ }
    }

    const updated = [...prev.experience]
    updated[idx] = entry
    return { ...prev, experience: updated }
  }

  // ── education.{index}.{field} ───────────
  if (parts[0] === 'education' && parts.length >= 3) {
    const idx = parseInt(parts[1], 10)
    if (isNaN(idx) || idx >= prev.education.length) return prev
    const field = parts.slice(2).join('.')
    const entry = { ...prev.education[idx] }
    if (field === 'institution') entry.institution = patch.newValue
    if (field === 'degree')      entry.degree      = patch.newValue
    if (field === 'detail')      entry.detail      = patch.newValue || undefined
    const updated = [...prev.education]
    updated[idx] = entry
    return { ...prev, education: updated }
  }

  // ── certifications / awards (arrays) ────
  if (parts[0] === 'certifications' && parts.length === 1) {
    try { return { ...prev, certifications: JSON.parse(patch.newValue) } } catch { return prev }
  }
  if (parts[0] === 'awards' && parts.length === 1) {
    try { return { ...prev, awards: JSON.parse(patch.newValue) } } catch { return prev }
  }

  return prev
}

// ==========================================
// HOOK
// ==========================================

export function useCVState() {
  const [cv, setCV] = useState<CVData>(makeInitialCV)

  // =============================
  // Part 1 — AI patches
  // =============================
  const applyPatch = useCallback((patch: FieldPatch) => {
    setCV(prev => applyFieldPatch(prev, patch))
  }, [])

  const rejectPatch = useCallback((_field: string) => {
    // Patches aren't stored in useCVState — they live in Sidebar chat state.
    // This is a no-op kept for API compatibility.
  }, [])

  const queuePatches = useCallback((_patches: FieldPatch[]) => {
    // No-op — chat-based patches are handled inside Sidebar now.
  }, [])

  // =============================
  // Part 2 — Contact live edits
  // =============================
  const updateContact = useCallback(
    (field: 'address' | 'phone' | 'email', value: string) => {
      setCV(prev => ({
        ...prev,
        _static: {
          ...prev._static,
          contact: { ...prev._static.contact, [field]: value },
        },
      }))
    },
    [],
  )

  // =============================
  // Part 3 — Persist all settings
  // Saves contact + any other user prefs to localStorage.
  // =============================
  const persistSettings = useCallback((
    updatedContact: CVData['_static']['contact'],
    apiKey: string,
  ) => {
    saveContactToStorage(updatedContact)
    localStorage.setItem('gemini_api_key', apiKey)
  }, [])

  return {
    cv, setCV,
    applyPatch, rejectPatch, queuePatches,
    updateContact, persistSettings,
    // expose pending as empty array for API compat
    pending: [] as FieldPatch[],
  }
}
