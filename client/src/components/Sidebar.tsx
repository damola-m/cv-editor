/* ===================================
   Sidebar.tsx
   -----------------------------------
   - Collapsible left sidebar.
   - Expanded (300px): logo, AI Tailor textarea that grows
     with viewport height, collapsible Settings, Export PDF.
   - Collapsed (52px): icon-only rail.
   =================================== */
import { useState } from 'react'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { adjustCVForJob, fetchJobText } from '../services/gemini'

// ==========================================
// CONSTANTS
// ==========================================
export const SIDEBAR_W_OPEN   = 300
export const SIDEBAR_W_CLOSED = 52

// ==========================================
// TYPES
// ==========================================
interface Props {
  cv:             CVData
  pending:        FieldPatch[]
  onPatches:      (patches: FieldPatch[]) => void
  onApply:        (patch: FieldPatch) => void
  onReject:       (field: string) => void
  onExport:       () => void
  exporting:      boolean
  open:           boolean
  onToggle:       () => void
  onContactChange: (field: 'address' | 'phone' | 'email', value: string) => void
}

type Status = 'idle' | 'fetching' | 'thinking' | 'done' | 'error'

// ==========================================
// DESIGN TOKENS
// ==========================================
const BG     = '#0a0a0a'
const SURF   = '#161616'
const TEAL   = '#1bb5b6'
const TEXT   = '#f0f0f0'
const MUTED  = 'rgba(240,240,240,0.45)'
const BORDER = 'rgba(255,255,255,0.07)'

// ==========================================
// SVG ICON COMPONENTS
// ==========================================

function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <path d="M7.5 0 L8.7 5.3 L14 7.5 L8.7 9.7 L7.5 15 L6.3 9.7 L1 7.5 L6.3 5.3 Z" />
    </svg>
  )
}

function CogIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
               1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33
               l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4
               h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68
               a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33
               l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4
               h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function ChevronUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

// ==========================================
// SHARED STYLE HELPERS
// ==========================================

function Divider() {
  return <div style={{ height: 1, background: BORDER, flexShrink: 0 }} />
}

function SectionRow({ icon, label, open, right }: {
  icon: React.ReactNode; label: string; open: boolean; right?: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 9,
      padding: '8px 14px 6px',
      fontSize: 10, fontWeight: 700, color: MUTED,
      fontFamily: 'Arial, sans-serif', letterSpacing: 1,
      textTransform: 'uppercase', flexShrink: 0,
    }}>
      <span style={{ color: MUTED, display: 'flex', alignItems: 'center' }}>{icon}</span>
      {open && <span style={{ flex: 1, whiteSpace: 'nowrap' }}>{label}</span>}
      {open && right}
    </div>
  )
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export function Sidebar({
  cv, pending, onPatches, onApply, onReject,
  onExport, exporting, open, onToggle, onContactChange,
}: Props) {

  const [input,        setInput]       = useState('')
  const [status,       setStatus]      = useState<Status>('idle')
  const [error,        setError]       = useState('')
  const [apiKey,       setApiKey]      = useState(() => localStorage.getItem('gemini_api_key') ?? '')
  const [keySaved,     setKeySaved]    = useState(false)
  const [settingsOpen, setSettings]    = useState(false)

  const contact = cv._static.contact

  const busy = status === 'fetching' || status === 'thinking'

  // =============================
  // Part 1 — AI Tailor submit
  // =============================
  async function handleTailor() {
    const key = localStorage.getItem('gemini_api_key') ?? ''
    if (!key) { setError('Add your Gemini API key in Settings first.'); setStatus('error'); return }
    setError('')
    let jobText = input.trim()
    if (!jobText) { setError('Paste a job URL or description.'); setStatus('error'); return }
    if (jobText.startsWith('http')) {
      setStatus('fetching')
      const fetched = await fetchJobText(jobText)
      if (fetched) { jobText = fetched }
      else { setError("Couldn't fetch that URL — paste the job description directly."); setStatus('error'); return }
    }
    setStatus('thinking')
    try {
      const patches = await adjustCVForJob(key, cv, jobText)
      onPatches(patches)
      setStatus('done')
      setInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gemini API error.')
      setStatus('error')
    }
  }

  // =============================
  // Part 2 — Save API key
  // =============================
  function saveKey() {
    localStorage.setItem('gemini_api_key', apiKey)
    setKeySaved(true)
    setTimeout(() => setKeySaved(false), 2000)
  }

  const w = open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED

  return (
    <div
      className="no-print"
      style={{
        width: w, minWidth: w, maxWidth: w,
        height: '100vh',
        background: BG,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.22s ease, min-width 0.22s ease, max-width 0.22s ease',
        flexShrink: 0,
        borderRight: `1px solid ${BORDER}`,
        zIndex: 100,
      }}
    >
      {/* =============================
          Part 3 — Header
          ============================= */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: open ? 'space-between' : 'center',
        padding: '14px 10px 12px',
        flexShrink: 0,
      }}>
        {/* Logo mark + text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6, background: TEAL, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#fff',
            fontFamily: 'Calibri, sans-serif', letterSpacing: 0.5,
          }}>
            CV
          </div>
          {open && (
            <span style={{
              fontFamily: 'Calibri, sans-serif', fontSize: 14,
              fontWeight: 700, color: TEXT, whiteSpace: 'nowrap',
            }}>
              CV Editor
            </span>
          )}
        </div>
        {/* Collapse/expand toggle */}
        <button
          onClick={onToggle}
          title={open ? 'Collapse' : 'Expand'}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: MUTED, padding: 6, display: 'flex', alignItems: 'center',
            borderRadius: 4, flexShrink: 0,
          }}
        >
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      <Divider />

      {/* =============================
          Part 4 — AI Tailor (flex:1 — grows with viewport)
          ============================= */}
      <div style={{
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column',
        padding: open ? '8px 10px 10px' : '8px 0',
        overflow: 'hidden',
      }}>
        <SectionRow icon={<SparkleIcon />} label="AI Tailor" open={open} />

        {open ? (
          <>
            {/* Pending diffs */}
            {pending.length > 0 && (
              <div style={{ flexShrink: 0, marginBottom: 8 }}>
                {pending.map(patch => (
                  <div key={patch.field} style={{
                    background: SURF, borderRadius: 6, marginBottom: 6,
                    border: `1px solid ${BORDER}`, overflow: 'hidden',
                  }}>
                    <div style={{
                      padding: '5px 10px', fontSize: 10, fontWeight: 700,
                      color: TEAL, fontFamily: 'Arial, sans-serif',
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      {patch.field === 'summary' ? 'Professional Summary' : patch.field}
                    </div>
                    <div style={{
                      padding: '7px 10px', fontSize: 11, color: TEXT,
                      lineHeight: 1.5, maxHeight: 90, overflowY: 'auto',
                      fontFamily: 'Arial, sans-serif', whiteSpace: 'pre-wrap',
                    }}>
                      {patch.newValue}
                    </div>
                    <div style={{
                      display: 'flex', gap: 6, padding: '6px 10px',
                      borderTop: `1px solid ${BORDER}`,
                    }}>
                      <button onClick={() => onApply(patch)} style={{
                        flex: 1, padding: '5px 0', background: TEAL, color: '#fff',
                        border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'Arial, sans-serif',
                      }}>
                        ✓ Accept
                      </button>
                      <button onClick={() => onReject(patch.field)} style={{
                        flex: 1, padding: '5px 0', background: 'transparent',
                        color: MUTED, border: `1px solid ${BORDER}`,
                        borderRadius: 4, fontSize: 11, cursor: 'pointer',
                        fontFamily: 'Arial, sans-serif',
                      }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {status === 'done' && pending.length === 0 && (
              <div style={{
                fontSize: 11, color: TEAL, marginBottom: 6,
                fontFamily: 'Arial, sans-serif', flexShrink: 0,
              }}>
                ✓ All changes applied.
              </div>
            )}

            {/* Textarea — grows to fill remaining space */}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTailor() }}
              placeholder={'Paste job URL or description…\n\nCtrl+Enter to send'}
              style={{
                flex: 1, minHeight: 100,
                width: '100%', boxSizing: 'border-box',
                background: SURF, border: `1px solid ${BORDER}`,
                borderRadius: 6, color: TEXT,
                fontSize: 12, lineHeight: 1.55,
                padding: '10px 12px', resize: 'none',
                fontFamily: 'Arial, sans-serif', outline: 'none',
              }}
            />

            {error && (
              <div style={{
                fontSize: 11, color: '#f87171', marginTop: 4,
                fontFamily: 'Arial, sans-serif', flexShrink: 0,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleTailor}
              disabled={busy}
              style={{
                marginTop: 8, width: '100%', padding: '9px 0', flexShrink: 0,
                background: busy ? '#1f2937' : TEAL,
                color: busy ? MUTED : '#fff',
                border: 'none', borderRadius: 6,
                fontSize: 12, fontWeight: 700,
                cursor: busy ? 'not-allowed' : 'pointer',
                fontFamily: 'Arial, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              }}
            >
              <SparkleIcon />
              {status === 'fetching' ? 'Fetching…' :
               status === 'thinking' ? 'Tailoring…' : 'Tailor CV'}
            </button>
          </>
        ) : (
          /* Collapsed icon with pending badge */
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <button onClick={onToggle} title="Open AI Tailor" style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: MUTED, padding: '8px 0', display: 'flex',
            }}>
              <SparkleIcon />
            </button>
            {pending.length > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                width: 14, height: 14, borderRadius: '50%',
                background: '#ef4444', color: '#fff',
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {pending.length}
              </span>
            )}
          </div>
        )}
      </div>

      <Divider />

      {/* =============================
          Part 5 — Settings (collapsible accordion)
          ============================= */}
      <div style={{ flexShrink: 0 }}>
        {open ? (
          <>
            {/* Accordion header */}
            <button
              onClick={() => setSettings(v => !v)}
              style={{
                width: '100%', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 14px', color: MUTED,
                fontFamily: 'Arial, sans-serif', fontSize: 10,
                fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
              }}
            >
              <CogIcon />
              <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>
              {settingsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {/* Accordion body */}
            {settingsOpen && (
              <div style={{ padding: '0 10px 10px' }}>
                {/* ── Contact info ───────────────── */}
                {(
                  [
                    { key: 'address', label: 'Address', placeholder: 'e.g. London, UK',       type: 'text'     },
                    { key: 'phone',   label: 'Phone',   placeholder: '+44 7000 000000',        type: 'tel'      },
                    { key: 'email',   label: 'Email',   placeholder: 'you@email.com',          type: 'email'    },
                  ] as const
                ).map(({ key, label, placeholder, type }) => (
                  <div key={key} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: MUTED, marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>
                      {label}
                    </div>
                    <input
                      type={type}
                      value={contact[key]}
                      onChange={e => onContactChange(key, e.target.value)}
                      placeholder={placeholder}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: SURF, border: `1px solid ${BORDER}`,
                        borderRadius: 6, color: TEXT,
                        fontSize: 12, padding: '7px 10px',
                        fontFamily: 'Arial, sans-serif', outline: 'none',
                      }}
                    />
                  </div>
                ))}

                {/* Divider between contact and API key */}
                <div style={{ height: 1, background: BORDER, margin: '4px 0 10px' }} />

                {/* ── Gemini API key ─────────────── */}
                <div style={{
                  fontSize: 11, color: MUTED, marginBottom: 4,
                  fontFamily: 'Arial, sans-serif',
                }}>
                  Gemini API key
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveKey() }}
                  placeholder="AIza…"
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: SURF, border: `1px solid ${BORDER}`,
                    borderRadius: 6, color: TEXT,
                    fontSize: 12, padding: '7px 10px',
                    fontFamily: 'Arial, sans-serif', outline: 'none',
                  }}
                />
                <button
                  onClick={saveKey}
                  style={{
                    marginTop: 6, width: '100%', padding: '7px 0',
                    background: keySaved ? '#064e3b' : SURF,
                    color: keySaved ? '#6ee7b7' : MUTED,
                    border: `1px solid ${BORDER}`, borderRadius: 6,
                    fontSize: 11, cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif', transition: 'all 0.2s',
                  }}
                >
                  {keySaved ? '✓ Saved' : 'Save key'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button onClick={onToggle} title="Settings" style={{
              background: 'none', border: 'none', cursor: 'pointer', color: MUTED,
            }}>
              <CogIcon />
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* =============================
          Part 6 — Export PDF
          ============================= */}
      <div style={{ padding: open ? '10px 10px 12px' : '10px 0 12px', flexShrink: 0 }}>
        {open ? (
          <button
            onClick={onExport}
            disabled={exporting}
            style={{
              width: '100%', padding: '9px 0',
              background: exporting ? SURF : TEAL,
              color: exporting ? MUTED : '#fff',
              border: 'none', borderRadius: 6,
              fontSize: 12, fontWeight: 700,
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontFamily: 'Arial, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <DownloadIcon />
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={onExport}
              disabled={exporting}
              title="Export PDF"
              style={{
                background: 'none', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer',
                color: exporting ? MUTED : TEAL,
              }}
            >
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>

      {/* Footer watermark */}
      {open && (
        <div style={{
          padding: '0 14px 10px', fontSize: 10,
          color: 'rgba(255,255,255,0.15)',
          fontFamily: 'Arial, sans-serif', flexShrink: 0,
        }}>
          Adedamola Michael · CV Editor
        </div>
      )}
    </div>
  )
}
