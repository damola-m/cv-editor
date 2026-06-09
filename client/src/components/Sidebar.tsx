/* ===================================
   Sidebar.tsx
   -----------------------------------
   - Collapsible left sidebar.
   - Sections: AI Tailor chat, Settings (accordion),
     Saved Versions, Export PDF.
   - Logo left-aligned, collapse toggle at bottom.
   =================================== */
import { useState, useRef, useEffect } from 'react'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { sendChatMessage, fetchJobText, type ChatMessage } from '../services/gemini'
import { exportPDFBlob } from '../utils/pdfExport'
import {
  loadVersions, saveVersion, deleteVersion,
  formatDate, type CVVersion,
} from '../services/cv-versions'

// ==========================================
// CONSTANTS
// ==========================================
export const SIDEBAR_W_OPEN   = 300
export const SIDEBAR_W_CLOSED = 52

// ==========================================
// TYPES
// ==========================================
interface Props {
  cv:              CVData
  pending:         FieldPatch[]
  onPatches:       (patches: FieldPatch[]) => void
  onApply:         (patch: FieldPatch) => void
  onReject:        (field: string) => void
  onExport:        () => void
  exporting:       boolean
  open:            boolean
  onToggle:        () => void
  onContactChange: (field: 'address' | 'phone' | 'email', value: string) => void
  onPersist:       (contact: CVData['_static']['contact'], apiKey: string) => void
  onReset:         () => void
  onLoadVersion:   (cv: CVData) => void
}

// ==========================================
// TOKENS
// ==========================================
const BG   = '#000000'
const SURF = '#141414'
const TEAL = '#1bb5b6'
const TEXT = '#f0f0f0'
const MUT  = 'rgba(240,240,240,0.45)'
const BRD  = 'rgba(255,255,255,0.07)'

// ==========================================
// ICONS
// ==========================================
const I = { // inline-SVG shortcuts
  Sparkle: () => <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor"><path d="M7.5 0 L8.7 5.3 L14 7.5 L8.7 9.7 L7.5 15 L6.3 9.7 L1 7.5 L6.3 5.3 Z"/></svg>,
  Cog: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Download: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  ChevL: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevD: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevU: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>,
  Clip: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
  Send: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  X: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Clock: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Reset: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>,
}

function Div() { return <div style={{ height: 1, background: BRD, flexShrink: 0 }} /> }
function uid() { return Math.random().toString(36).slice(2) }
function lbl(_s?: string) { return { fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, color: MUT, letterSpacing: 1, textTransform: 'uppercase' as const, padding: '8px 14px 6px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 } }
function field() { return { width: '100%', boxSizing: 'border-box' as const, background: SURF, border: `1px solid ${BRD}`, borderRadius: 6, color: TEXT, fontSize: 12, padding: '7px 10px', fontFamily: 'Arial, sans-serif', outline: 'none', marginBottom: 7 } }

// ==========================================
// MAIN COMPONENT
// ==========================================
export function Sidebar({
  cv, onApply,
  onExport, exporting, open, onToggle,
  onContactChange, onPersist,
  onReset, onLoadVersion,
}: Props) {

  // ── Chat ─────────────────────────────────
  const [msgs,       setMsgs]       = useState<ChatMessage[]>([])
  const [draft,      setDraft]      = useState('')
  const [thinking,   setThinking]   = useState(false)
  const [img,        setImg]        = useState<{ url: string; b64: string; mime: string } | null>(null)
  const threadRef = useRef<HTMLDivElement>(null)
  const fileRef   = useRef<HTMLInputElement>(null)

  // ── Settings ─────────────────────────────
  const [settOpen, setSettOpen] = useState(false)
  const [addr,     setAddr]     = useState(cv._static.contact.address)
  const [phone,    setPhone]    = useState(cv._static.contact.phone)
  const [email,    setEmail]    = useState(cv._static.contact.email)
  const [apiKey,   setApiKey]   = useState(() => localStorage.getItem('gemini_api_key') ?? '')
  const [saved,    setSaved]    = useState(false)
  const [hovSave,  setHovSave]  = useState(false)

  // ── Versions ─────────────────────────────
  const [verOpen,  setVerOpen]  = useState(false)
  const [versions, setVersions] = useState<CVVersion[]>(loadVersions)
  const [saveName, setSaveName] = useState('')
  const [dlding,   setDlding]   = useState<string | null>(null)

  // Sync settings inputs with cv prop
  useEffect(() => {
    setAddr(cv._static.contact.address)
    setPhone(cv._static.contact.phone)
    setEmail(cv._static.contact.email)
  }, [cv._static.contact.address, cv._static.contact.phone, cv._static.contact.email])

  // Scroll chat to bottom
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [msgs, thinking])

  // =============================
  // Part 1 — Image attach
  // =============================
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = () => {
      const url = r.result as string
      setImg({ url, b64: url.split(',')[1], mime: f.type || 'image/jpeg' })
    }
    r.readAsDataURL(f)
    e.target.value = ''
  }

  // =============================
  // Part 2 — Send chat message
  // =============================
  async function handleSend() {
    const text = draft.trim()
    if (!text && !img) return
    const key = localStorage.getItem('gemini_api_key') ?? ''
    if (!key) {
      setMsgs(m => [...m, { id: uid(), role: 'assistant', error: true, text: 'Add your Gemini API key in Settings first.' }])
      return
    }
    const user: ChatMessage = { id: uid(), role: 'user', text, imageUrl: img?.url }
    setMsgs(m => [...m, user]); setDraft(''); setImg(null); setThinking(true)
    try {
      let resolved = text
      if (text.startsWith('http') && !img) {
        const fetched = await fetchJobText(text)
        resolved = fetched ? `Tailor my CV for this job:\n\n${fetched}` : text
      }
      const hist = [...msgs, user].filter(m => !m.error)
      const { message, patches } = await sendChatMessage(key, cv, hist, resolved || '[image attached]', img?.b64, img?.mime)
      setMsgs(m => [...m, { id: uid(), role: 'assistant', text: message, patches: patches.length ? patches : undefined }])
    } catch (e) {
      setMsgs(m => [...m, { id: uid(), role: 'assistant', error: true, text: e instanceof Error ? e.message : 'Error.' }])
    } finally { setThinking(false) }
  }

  // =============================
  // Part 3 — Apply / dismiss patch
  // =============================
  function applyOne(msgId: string, patch: FieldPatch) {
    onApply(patch)
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, patches: msg.patches?.filter(p => p.field !== patch.field) } : msg))
  }
  function dimissOne(msgId: string, field: string) {
    setMsgs(m => m.map(msg => msg.id === msgId ? { ...msg, patches: msg.patches?.filter(p => p.field !== field) } : msg))
  }

  // =============================
  // Part 4 — Save settings
  // =============================
  function handleSave() {
    const contact = { ...cv._static.contact, address: addr, phone, email }
    onContactChange('address', addr); onContactChange('phone', phone); onContactChange('email', email)
    onPersist(contact, apiKey)
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  // =============================
  // Part 5 — Version management
  // =============================
  function handleSaveVersion() {
    const name = saveName.trim() || `Version ${new Date().toLocaleDateString()}`
    const v = saveVersion(name, cv)
    setVersions(loadVersions())
    setSaveName('')
    alert(`Saved: "${v.name}"`)
  }

  function handleDeleteVersion(id: string) {
    deleteVersion(id); setVersions(loadVersions())
  }

  async function handleDownloadVersion(v: CVVersion) {
    setDlding(v.id)
    try {
      // Temporarily load version, export PDF, restore
      onLoadVersion(v.cv)
      await new Promise(r => setTimeout(r, 800)) // wait for render
      const blob = await exportPDFBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `${v.name}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Export failed') }
    finally { setDlding(null) }
  }

  const w = open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED

  return (
    <div
      className="no-print"
      style={{ width: w, minWidth: w, maxWidth: w, height: '100vh', background: BG, display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'width 0.22s ease, min-width 0.22s ease, max-width 0.22s ease', flexShrink: 0, borderRight: `1px solid ${BRD}`, zIndex: 100 }}
    >
      {/* ── Logo (left-aligned) ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 12px 12px', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: TEAL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'Calibri, sans-serif', letterSpacing: 0.5 }}>CV</div>
        {open && <span style={{ fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap' }}>CV Editor</span>}
      </div>

      <Div />

      {/* ── AI Tailor ────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={lbl('')}><I.Sparkle />{open && <span>AI Tailor</span>}</div>

        {open ? (
          <>
            {/* Thread */}
            <div ref={threadRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {msgs.length === 0 && (
                <div style={{ fontSize: 11, color: MUT, fontFamily: 'Arial, sans-serif', lineHeight: 1.55, padding: '8px 0' }}>
                  Ask me to tailor your CV, edit any section, or paste a job URL. You can also attach screenshots.
                </div>
              )}
              {msgs.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="" style={{ maxWidth: 160, borderRadius: 6, border: `1px solid ${BRD}` }} />}
                  {msg.text && (
                    <div style={{ maxWidth: '92%', padding: '7px 10px', borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px', background: msg.role === 'user' ? TEAL : msg.error ? '#2d1a1a' : SURF, color: msg.role === 'user' ? '#fff' : msg.error ? '#f87171' : TEXT, fontSize: 12, fontFamily: 'Arial, sans-serif', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.text}
                    </div>
                  )}
                  {msg.patches?.map(p => (
                    <div key={p.field} style={{ width: '100%', background: SURF, borderRadius: 8, border: `1px solid ${BRD}`, overflow: 'hidden' }}>
                      <div style={{ padding: '4px 10px', fontSize: 10, fontWeight: 700, color: TEAL, fontFamily: 'Arial, sans-serif', borderBottom: `1px solid ${BRD}` }}>
                        {p.field === 'summary' ? 'Professional Summary' : p.field.startsWith('experience.') ? `Job — ${p.field.split('.').slice(1, 3).join(' › ')}` : p.field}
                      </div>
                      <div style={{ padding: '6px 10px', fontSize: 11, color: TEXT, fontFamily: 'Arial, sans-serif', lineHeight: 1.45, maxHeight: 80, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {p.newValue.slice(0, 200)}{p.newValue.length > 200 ? '…' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 6, padding: '5px 10px', borderTop: `1px solid ${BRD}` }}>
                        <button type="button" onClick={() => applyOne(msg.id, p)} style={{ flex: 1, padding: '4px 0', background: TEAL, color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>✓ Apply</button>
                        <button type="button" onClick={() => dimissOne(msg.id, p.field)} style={{ flex: 1, padding: '4px 0', background: 'transparent', color: MUT, border: `1px solid ${BRD}`, borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>Dismiss</button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              {thinking && (
                <div style={{ display: 'flex', gap: 4, padding: '4px 0', alignItems: 'center' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: TEAL, animation: `cv-pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}/>)}
                </div>
              )}
            </div>

            {/* Image preview */}
            {img && (
              <div style={{ margin: '0 10px 4px', position: 'relative', display: 'inline-block' }}>
                <img src={img.url} alt="" style={{ height: 44, borderRadius: 5, border: `1px solid ${BRD}` }} />
                <button type="button" onClick={() => setImg(null)} style={{ position: 'absolute', top: -4, right: -4, background: '#333', border: 'none', borderRadius: '50%', width: 15, height: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT }}><I.X /></button>
              </div>
            )}

            {/* Input row */}
            <div style={{ padding: '8px 10px 8px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                <textarea
                  value={draft} rows={4}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !thinking) handleSend() }}
                  placeholder="Ask or paste a job URL…"
                  style={{ flex: 1, minWidth: 0, background: SURF, border: `1px solid ${BRD}`, borderRadius: 6, color: TEXT, fontSize: 12, lineHeight: 1.45, padding: '8px 10px', resize: 'none', fontFamily: 'Arial, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => fileRef.current?.click()} title="Attach image" style={{ background: 'none', border: `1px solid ${BRD}`, borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: MUT, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Clip /></button>
                  <button type="button" onClick={handleSend} disabled={thinking} style={{ flex: 1, background: thinking ? SURF : TEAL, border: 'none', borderRadius: 6, padding: '7px 9px', cursor: thinking ? 'not-allowed' : 'pointer', color: thinking ? MUT : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I.Send /></button>
                </div>
              </div>
              <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" style={{ display: 'none' }} onChange={handleFile} />
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button type="button" onClick={onToggle} title="Open AI Tailor" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUT, display: 'flex' }}><I.Sparkle /></button>
          </div>
        )}
      </div>

      <Div />

      {/* ── Settings ────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        {open ? (
          <>
            <button type="button" onClick={() => setSettOpen(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', ...lbl(''), justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><I.Cog /><span>Settings</span></span>
              {settOpen ? <I.ChevU /> : <I.ChevD />}
            </button>
            {settOpen && (
              <div style={{ padding: '0 10px 10px' }}>
                {/* Contact */}
                {([ ['Address','text',addr,setAddr], ['Phone','tel',phone,setPhone], ['Email','email',email,setEmail] ] as const).map(([l,t,v,s]) => (
                  <div key={l}>
                    <div style={{ fontSize: 11, color: MUT, marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>{l}</div>
                    <input type={t} value={v} onChange={e => s(e.target.value)} style={field()} />
                  </div>
                ))}
                <div style={{ height: 1, background: BRD, margin: '4px 0 8px' }} />
                {/* API key */}
                <div style={{ fontSize: 11, color: MUT, marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>Gemini API key</div>
                <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSave() }} placeholder="AIza…" style={field()} />
                {/* Save */}
                <button type="button" onClick={handleSave} onMouseEnter={() => setHovSave(true)} onMouseLeave={() => setHovSave(false)}
                  style={{ width: '100%', padding: '8px 0', background: saved ? '#064e3b' : hovSave ? '#1f2937' : SURF, color: saved ? '#6ee7b7' : hovSave ? TEXT : MUT, border: `1px solid ${saved ? '#065f46' : hovSave ? '#374151' : BRD}`, borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'Arial, sans-serif', transition: 'all 0.15s', marginBottom: 8 }}>
                  {saved ? '✓ Saved' : 'Save'}
                </button>
                {/* Reset to default */}
                <button type="button"
                  onClick={() => { if (window.confirm('Reset all CV changes to the original default?')) { onReset(); setMsgs([]) } }}
                  style={{ width: '100%', padding: '7px 0', background: 'transparent', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <I.Reset /> Reset to Default
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button type="button" onClick={onToggle} title="Settings" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUT }}><I.Cog /></button>
          </div>
        )}
      </div>

      <Div />

      {/* ── Saved Versions ──────────────────── */}
      <div style={{ flexShrink: 0, maxHeight: verOpen ? 280 : 'auto', overflowY: verOpen ? 'auto' : 'visible' }}>
        {open ? (
          <>
            <button type="button" onClick={() => setVerOpen(v => !v)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', ...lbl(''), justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><I.Clock /><span>Versions{versions.length > 0 ? ` (${versions.length})` : ''}</span></span>
              {verOpen ? <I.ChevU /> : <I.ChevD />}
            </button>
            {verOpen && (
              <div style={{ padding: '0 10px 10px' }}>
                {/* Save current version */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input
                    type="text" value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSaveVersion() }}
                    placeholder="Version name…"
                    style={{ ...field(), marginBottom: 0, flex: 1 }}
                  />
                  <button type="button" onClick={handleSaveVersion}
                    style={{ background: TEAL, color: '#fff', border: 'none', borderRadius: 6, padding: '0 10px', fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif', whiteSpace: 'nowrap' }}>
                    Save
                  </button>
                </div>

                {/* Version list */}
                {versions.length === 0 ? (
                  <div style={{ fontSize: 11, color: MUT, fontFamily: 'Arial, sans-serif' }}>No saved versions yet.</div>
                ) : versions.map(v => (
                  <div key={v.id} style={{ background: SURF, borderRadius: 6, border: `1px solid ${BRD}`, padding: '7px 10px', marginBottom: 6 }}>
                    <div style={{ fontSize: 12, color: TEXT, fontFamily: 'Arial, sans-serif', fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                    <div style={{ fontSize: 10, color: MUT, fontFamily: 'Arial, sans-serif', marginBottom: 6 }}>{formatDate(v.savedAt)}</div>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <button type="button" onClick={() => onLoadVersion(v.cv)}
                        style={{ flex: 1, padding: '4px 0', background: 'transparent', color: TEAL, border: `1px solid ${BRD}`, borderRadius: 4, fontSize: 10, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                        Load
                      </button>
                      <button type="button" onClick={() => handleDownloadVersion(v)} disabled={dlding === v.id}
                        style={{ flex: 1, padding: '4px 0', background: TEAL, color: '#fff', border: 'none', borderRadius: 4, fontSize: 10, cursor: dlding === v.id ? 'wait' : 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        {dlding === v.id ? '…' : <><I.Download /> PDF</>}
                      </button>
                      <button type="button" onClick={() => handleDeleteVersion(v.id)}
                        style={{ padding: '4px 7px', background: 'transparent', color: '#f87171', border: `1px solid rgba(248,113,113,0.2)`, borderRadius: 4, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <I.X />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button type="button" onClick={onToggle} title="Versions" style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUT }}><I.Clock /></button>
          </div>
        )}
      </div>

      <Div />

      {/* ── Export PDF ──────────────────────── */}
      <div style={{ padding: open ? '10px 10px' : '10px 0', flexShrink: 0 }}>
        {open ? (
          <button type="button" onClick={onExport} disabled={exporting}
            style={{ width: '100%', padding: '9px 0', background: exporting ? SURF : TEAL, color: exporting ? MUT : '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <I.Download />
            {exporting ? 'Exporting…' : 'Export PDF'}
          </button>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={onExport} disabled={exporting} title="Export PDF" style={{ background: 'none', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer', color: exporting ? MUT : TEAL }}><I.Download /></button>
          </div>
        )}
      </div>

      {/* ── Collapse toggle at bottom ────────── */}
      <div style={{ borderTop: `1px solid ${BRD}`, flexShrink: 0 }}>
        <button type="button" onClick={onToggle} title={open ? 'Collapse' : 'Expand'}
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: MUT, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: open ? 'flex-end' : 'center', paddingRight: open ? 14 : 0, gap: 5 }}>
          {open && <span style={{ fontSize: 10, fontFamily: 'Arial, sans-serif' }}>Collapse</span>}
          {open ? <I.ChevL /> : <I.ChevR />}
        </button>
      </div>

      <style>{`@keyframes cv-pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}`}</style>
    </div>
  )
}
