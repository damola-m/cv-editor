/* ===================================
   SettingsModal.tsx
   -----------------------------------
   - API key entry, stored in localStorage.
   =================================== */
import { useState } from 'react'

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props) {
  const [key, setKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [saved, setSaved] = useState(false)

  function save() {
    localStorage.setItem('gemini_api_key', key.trim())
    setSaved(true)
    setTimeout(onClose, 800)
  }

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: '#fff', borderRadius: 12,
        padding: 32, width: 420,
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Settings</div>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
          Your Gemini API key is stored locally in this browser only — never sent anywhere
          except directly to Google's Gemini API.
        </div>
        <label style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>
          Gemini API Key
        </label>
        <input
          type="password"
          value={key}
          onChange={e => setKey(e.target.value)}
          placeholder="AIza..."
          style={{
            display: 'block', width: '100%', marginTop: 6,
            padding: '10px 12px', fontSize: 14,
            border: '1px solid #ddd', borderRadius: 6,
            boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            onClick={save}
            style={{
              flex: 1, padding: '10px 0',
              background: saved ? '#4caf50' : '#1bb5b6',
              color: '#fff', border: 'none', borderRadius: 6,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {saved ? '✓ Saved' : 'Save'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              background: '#fff', color: '#666',
              border: '1px solid #ccc', borderRadius: 6,
              fontSize: 14, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
