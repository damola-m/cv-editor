/* ===================================
   cv-versions.ts
   -----------------------------------
   - Saves, loads, and deletes named CV versions
     in localStorage (up to 20 kept).
   =================================== */
import type { CVData } from '../data/cv-data'

export type CVVersion = {
  id:       string
  name:     string
  savedAt:  string   // ISO date string
  cv:       CVData
}

const KEY = 'cv_versions'

export function loadVersions(): CVVersion[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CVVersion[]) : []
  } catch { return [] }
}

export function saveVersion(name: string, cv: CVData): CVVersion {
  const v: CVVersion = {
    id:      Date.now().toString(36),
    name:    name.trim() || 'Untitled version',
    savedAt: new Date().toISOString(),
    cv,
  }
  const versions = [v, ...loadVersions()].slice(0, 20)
  localStorage.setItem(KEY, JSON.stringify(versions))
  return v
}

export function deleteVersion(id: string): void {
  const versions = loadVersions().filter(v => v.id !== id)
  localStorage.setItem(KEY, JSON.stringify(versions))
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}
