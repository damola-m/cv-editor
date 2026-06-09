/* ===================================
   ChatPanel.tsx
   -----------------------------------
   - Floating chat popup (not a side panel).
   - Anchored bottom-left, just right of the FAB stack.
   - Accepts job URL or pasted text, calls Gemini,
     shows accept/reject diffs inline.
   =================================== */
import { useState } from 'react'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { adjustCVForJob, fetchJobText } from '../services/gemini'

interface Props {
  cv: CVData
  pending: FieldPatch[]
  onPatches: (patches: FieldPatch[]) => void
  onApply: (patch: FieldPatch) => void
  onReject: (field: string) => void
  onClose: () => void
}

type Status = 'idle' | 'fetching' | 'thinking' | 'done' | 'error'

export function ChatPanel({ cv, pending, onPatches, onApply, onReject, onClose }: Props) {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  // =============================
  // Part 1 — Submit handler
  // =============================
  async function handleSubmit() {
    const apiKey = localStorage.getItem('gemini_api_key') || ''
    if (!apiKey) {
      setError('No API key set — open Settings (⚙) and add your Gemini key.')
      setStatus('error')
      return
    }
    setError('')

    let jobText = input.trim()
    if (!jobText) {
      setError('Paste a job URL or description first.')
      setStatus('error')
      return
    }

    if (jobText.startsWith('http')) {
      setStatus('fetching')
      const fetched = await fetchJobText(jobText)
      if (fetched) {
        jobText = fetched
      } else {
        setError("Couldn't fetch that URL (CORS blocked). Paste the job description directly instead.")
        setStatus('error')
        return
      }
    }

    setStatus('thinking')
    try {
      const patches = await adjustCVForJob(apiKey, cv, jobText)
      onPatches(patches)
      setStatus('done')
      setInput('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gemini API error.')
      setStatus('error')
    }
  }

  const busy = status === 'fetching' || status === 'thinking'

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 92,           // 24px margin + 52px FAB + 16px gap
        width: 420,
        maxHeight: '70vh',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 8px 36px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 600,
        overflow: 'hidden',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* =============================
          Part 2 — Header
          ============================= */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        background: '#fafafa',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>✦ AI Job Tailor</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            Paste a job URL or description — AI will tailor your CV text
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 18, color: '#aaa', lineHeight: 1, padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* =============================
          Part 3 — Pending diffs
          ============================= */}
      {pending.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {pending.map(patch => (
            <div key={patch.field} style={{
              marginBottom: 12,
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <div style={{
                background: '#f5f5f5',
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: 700,
                color: '#444',
              }}>
                {patch.field === 'summary' ? 'Professional Summary' : patch.field}
              </div>
              <div style={{
                padding: '10px 12px',
                fontSize: 12,
                lineHeight: 1.55,
                color: '#222',
                maxHeight: 160,
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {patch.newValue}
              </div>
              <div style={{
                display: 'flex',
                gap: 8,
                padding: '8px 12px',
                borderTop: '1px solid #eee',
              }}>
                <button
                  onClick={() => onApply(patch)}
                  style={{
                    flex: 1, padding: '7px 0',
                    background: '#1bb5b6', color: '#fff',
                    border: 'none', borderRadius: 5,
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  ✓ Accept
                </button>
                <button
                  onClick={() => onReject(patch.field)}
                  style={{
                    flex: 1, padding: '7px 0',
                    background: '#fff', color: '#666',
                    border: '1px solid #ddd', borderRadius: 5,
                    fontSize: 12, cursor: 'pointer',
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {status === 'done' && pending.length === 0 && (
        <div style={{ padding: '14px 16px', fontSize: 13, color: '#666' }}>
          ✓ All changes applied. Paste another job to re-tailor.
        </div>
      )}

      {/* =============================
          Part 4 — Input + send
          ============================= */}
      <div style={{
        padding: '12px 14px',
        borderTop: pending.length > 0 ? '1px solid #eee' : 'none',
        background: '#fff',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit() }}
          placeholder="Paste job URL or job description here... (Ctrl+Enter to send)"
          rows={4}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 13,
            border: '1px solid #ddd',
            borderRadius: 8,
            resize: 'none',
            fontFamily: 'Arial, sans-serif',
            boxSizing: 'border-box',
            outline: 'none',
            lineHeight: 1.5,
          }}
        />
        {error && (
          <div style={{ marginTop: 6, fontSize: 12, color: '#c00' }}>{error}</div>
        )}
        <button
          onClick={handleSubmit}
          disabled={busy}
          style={{
            marginTop: 8,
            width: '100%',
            padding: '10px 0',
            background: busy ? '#ccc' : '#1bb5b6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            cursor: busy ? 'not-allowed' : 'pointer',
          }}
        >
          {status === 'fetching' ? '⏳ Fetching job page...' :
           status === 'thinking' ? '✦ Tailoring CV...' : '✦ Tailor CV'}
        </button>
      </div>
    </div>
  )
}
