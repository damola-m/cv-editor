/* ===================================
   useCVState.ts
   -----------------------------------
   - Manages CV data state + AI diff apply/revert.
   - Also exposes updateContact for live edits to
     address / phone / email from Settings.
   =================================== */
import { useState, useCallback } from 'react'
import { defaultCV, type CVData } from '../data/cv-data'

export type FieldPatch = { field: string; newValue: string }

export function useCVState() {
  const [cv, setCV] = useState<CVData>(defaultCV)
  const [pending, setPending] = useState<FieldPatch[]>([])

  // =============================
  // Part 1 — Apply AI patches
  // =============================
  const applyPatch = useCallback((patch: FieldPatch) => {
    setCV(prev => {
      if (patch.field === 'summary') return { ...prev, summary: patch.newValue }
      return prev
    })
    setPending(prev => prev.filter(p => p.field !== patch.field))
  }, [])

  const rejectPatch = useCallback((field: string) => {
    setPending(prev => prev.filter(p => p.field !== field))
  }, [])

  const queuePatches = useCallback((patches: FieldPatch[]) => {
    setPending(patches)
  }, [])

  // =============================
  // Part 2 — Live contact edits
  // Updates _static.contact fields (address, phone, email).
  // These immediately reflect on the cover page.
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

  return { cv, setCV, pending, queuePatches, applyPatch, rejectPatch, updateContact }
}
