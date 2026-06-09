/* ===================================
   Sidebar.tsx
   -----------------------------------
   - Collapsible left sidebar.
   - AI Tailor: full conversational chat thread
     with image-upload support.
   - Settings: Address / Phone / Email + API key,
     all saved to localStorage on single "Save" click.
   - Export PDF button.
   =================================== */
import { useState, useRef, useEffect } from 'react'
import type { CVData } from '../data/cv-data'
import type { FieldPatch } from '../hooks/useCVState'
import { sendChatMessage, fetchJobText, type ChatMessage } from '../services/gemini'

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
}

// ==========================================
// DESIGN TOKENS
// ==========================================
const BG    = '#000000'
const SURF  = '#141414'
const TEAL  = '#1bb5b6'
const TEXT  = '#f0f0f0'
const MUTED = 'rgba(240,240,240,0.45)'
const BORD  = 'rgba(255,255,255,0.07)'

// ==========================================
// SVG ICONS
// ==========================================
function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
      <path d="M7.5 0 L8.7 5.3 L14 7.5 L8.7 9.7 L7.5 15 L6.3 9.7 L1 7.5 L6.3 5.3 Z"/>
    </svg>
  )
}
function CogIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33
               1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33
               l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4
               h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06
               A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51
               1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9
               a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
function ChevronLeftIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg> }
function ChevronRightIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg> }
function ChevronDownIcon()  { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg> }
function ChevronUpIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg> }
function PaperclipIcon()    { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> }
function SendIcon()         { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> }
function XIcon()            { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> }

// ==========================================
// HELPERS
// ==========================================
function Divider() {
  return <div style={{ height: 1, background: BORD, flexShrink: 0 }} />
}

function uid() { return Math.random().toString(36).slice(2) }

// ==========================================
// MAIN COMPONENT
// ==========================================
export function Sidebar({
  cv, onApply,
  onExport, exporting, open, onToggle,
  onContactChange, onPersist,
}: Props) {

  // ── Chat state ────────────────────────────────────
  const [messages,     setMessages]     = useState<ChatMessage[]>([])
  const [draft,        setDraft]        = useState('')
  const [thinking,     setThinking]     = useState(false)
  const [pendingImg,   setPendingImg]   = useState<{ url: string; b64: string; mime: string } | null>(null)
  const threadRef  = useRef<HTMLDivElement>(null)
  const fileRef    = useRef<HTMLInputElement>(null)

  // ── Settings state ───────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addr,         setAddr]         = useState(cv._static.contact.address)
  const [phone,        setPhone]        = useState(cv._static.contact.phone)
  const [email,        setEmail]        = useState(cv._static.contact.email)
  const [apiKey,       setApiKey]       = useState(() => localStorage.getItem('gemini_api_key') ?? '')
  const [saved,        setSaved]        = useState(false)
  const [hovSave,      setHovSave]      = useState(false)

  // Keep local settings inputs in sync when cv prop changes
  useEffect(() => {
    setAddr(cv._static.contact.address)
    setPhone(cv._static.contact.phone)
    setEmail(cv._static.contact.email)
  }, [cv._static.contact.address, cv._static.contact.phone, cv._static.contact.email])

  // Scroll to bottom on new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, thinking])

  // =============================
  // Part 1 — Image attachment
  // =============================
  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const b64  = url.split(',')[1]
      const mime = file.type || 'image/jpeg'
      setPendingImg({ url, b64, mime })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // =============================
  // Part 2 — Send message
  // =============================
  async function handleSend() {
    const text = draft.trim()
    if (!text && !pendingImg) return
    const key = localStorage.getItem('gemini_api_key') ?? ''
    if (!key) {
      setMessages(m => [...m, {
        id: uid(), role: 'assistant', error: true,
        text: 'No Gemini API key set. Open Settings and add one first.',
      }])
      return
    }

    const userMsg: ChatMessage = {
      id: uid(), role: 'user', text,
      imageUrl: pendingImg?.url,
    }
    setMessages(m => [...m, userMsg])
    setDraft('')
    setPendingImg(null)
    setThinking(true)

    try {
      // Resolve job URL if message looks like a URL
      let resolvedText = text
      if (text.startsWith('http') && !pendingImg) {
        const fetched = await fetchJobText(text)
        resolvedText = fetched
          ? `Tailor my CV for this job:\n\n${fetched}`
          : text   // keep original if fetch failed
      }

      const history = messages.concat(userMsg)
        .filter(m => !m.error)
        .map(m => ({ ...m, text: m.text || '' }))

      const { message, patches } = await sendChatMessage(
        key, cv, history,
        resolvedText || '[image attached]',
        pendingImg?.b64,
        pendingImg?.mime,
      )

      setMessages(m => [...m, {
        id: uid(), role: 'assistant', text: message,
        patches: patches.length ? patches : undefined,
      }])
    } catch (e) {
      setMessages(m => [...m, {
        id: uid(), role: 'assistant', error: true,
        text: e instanceof Error ? e.message : 'Something went wrong.',
      }])
    } finally {
      setThinking(false)
    }
  }

  // =============================
  // Part 3 — Apply / reject patch
  // =============================
  function applyOne(msgId: string, patch: FieldPatch) {
    onApply(patch)
    setMessages(m => m.map(msg =>
      msg.id === msgId
        ? { ...msg, patches: msg.patches?.filter(p => p.field !== patch.field) }
        : msg,
    ))
  }
  function rejectOne(msgId: string, field: string) {
    setMessages(m => m.map(msg =>
      msg.id === msgId
        ? { ...msg, patches: msg.patches?.filter(p => p.field !== field) }
        : msg,
    ))
  }

  // =============================
  // Part 4 — Save all settings
  // =============================
  function handleSave() {
    const contact = { ...cv._static.contact, address: addr, phone, email }
    onContactChange('address', addr)
    onContactChange('phone',   phone)
    onContactChange('email',   email)
    onPersist(contact, apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const w = open ? SIDEBAR_W_OPEN : SIDEBAR_W_CLOSED

  return (
    <div
      className="no-print"
      style={{
        width: w, minWidth: w, maxWidth: w, height: '100vh',
        background: BG, display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.22s ease, min-width 0.22s ease, max-width 0.22s ease',
        flexShrink: 0, borderRight: `1px solid ${BORD}`, zIndex: 100,
      }}
    >
      {/* ============================
          Header
          ============================ */}
      {/* Logo — no toggle button here to avoid overlap in collapsed state */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '14px 10px 12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, overflow: 'hidden' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: TEAL, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', fontFamily: 'Calibri, sans-serif', letterSpacing: 0.5 }}>
            CV
          </div>
          {open && <span style={{ fontFamily: 'Calibri, sans-serif', fontSize: 14, fontWeight: 700, color: TEXT, whiteSpace: 'nowrap' }}>CV Editor</span>}
        </div>
      </div>

      <Divider />

      {/* ============================
          AI Tailor — chat thread
          ============================ */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Section label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px 6px', fontSize: 10, fontWeight: 700, color: MUTED, fontFamily: 'Arial, sans-serif', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}>
          <span style={{ color: MUTED, display: 'flex' }}><SparkleIcon /></span>
          {open && <span>AI Tailor</span>}
        </div>

        {open ? (
          <>
            {/* Message thread */}
            <div
              ref={threadRef}
              style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 8 }}
            >
              {messages.length === 0 && (
                <div style={{ padding: '12px 0', fontSize: 11, color: MUTED, fontFamily: 'Arial, sans-serif', lineHeight: 1.5 }}>
                  Ask me to tailor your CV, edit a specific section, or paste a job URL.<br/>You can also attach screenshots.
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 4 }}>
                  {/* Image thumbnail (user messages) */}
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="attachment"
                      style={{ maxWidth: 160, borderRadius: 6, border: `1px solid ${BORD}` }}
                    />
                  )}

                  {/* Message bubble */}
                  {msg.text && (
                    <div style={{
                      maxWidth: '90%',
                      padding: '8px 10px',
                      borderRadius: msg.role === 'user' ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                      background: msg.role === 'user' ? TEAL : msg.error ? '#2d1a1a' : SURF,
                      color: msg.role === 'user' ? '#fff' : msg.error ? '#f87171' : TEXT,
                      fontSize: 12, fontFamily: 'Arial, sans-serif',
                      lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {msg.text}
                    </div>
                  )}

                  {/* Patch diff cards */}
                  {msg.patches && msg.patches.map(patch => (
                    <div key={patch.field} style={{ width: '100%', background: SURF, borderRadius: 8, border: `1px solid ${BORD}`, overflow: 'hidden' }}>
                      <div style={{ padding: '5px 10px', fontSize: 10, fontWeight: 700, color: TEAL, fontFamily: 'Arial, sans-serif', borderBottom: `1px solid ${BORD}` }}>
                        {patch.field === 'summary' ? 'Professional Summary'
                          : patch.field.startsWith('experience.') ? `Job — ${patch.field.split('.').slice(1, 3).join(' › ')}`
                          : patch.field}
                      </div>
                      <div style={{ padding: '7px 10px', fontSize: 11, color: TEXT, fontFamily: 'Arial, sans-serif', lineHeight: 1.5, maxHeight: 80, overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
                        {patch.newValue.slice(0, 200)}{patch.newValue.length > 200 ? '…' : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 6, padding: '6px 10px', borderTop: `1px solid ${BORD}` }}>
                        <button type="button" onClick={() => applyOne(msg.id, patch)}
                          style={{ flex: 1, padding: '5px 0', background: TEAL, color: '#fff', border: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                          ✓ Apply
                        </button>
                        <button type="button" onClick={() => rejectOne(msg.id, patch.field)}
                          style={{ flex: 1, padding: '5px 0', background: 'transparent', color: MUTED, border: `1px solid ${BORD}`, borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'Arial, sans-serif' }}>
                          Dismiss
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Thinking indicator */}
              {thinking && (
                <div style={{ display: 'flex', gap: 4, padding: '6px 0', alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: 6, height: 6, borderRadius: '50%', background: TEAL,
                      animation: `cv-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }}/>
                  ))}
                </div>
              )}
            </div>

            {/* Pending image preview */}
            {pendingImg && (
              <div style={{ margin: '0 10px 4px', position: 'relative', display: 'inline-block' }}>
                <img src={pendingImg.url} alt="pending" style={{ height: 48, borderRadius: 5, border: `1px solid ${BORD}` }} />
                <button type="button" onClick={() => setPendingImg(null)}
                  style={{ position: 'absolute', top: -4, right: -4, background: '#333', border: 'none', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: TEXT }}>
                  <XIcon />
                </button>
              </div>
            )}

            {/* Input row — textarea fills width; attach+send stacked on the right */}
            <div style={{ padding: '8px 10px 10px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                {/* Textarea takes all horizontal space */}
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !thinking) handleSend() }}
                  placeholder="Ask or paste a job URL…"
                  rows={4}
                  style={{
                    flex: 1, minWidth: 0,
                    background: SURF, border: `1px solid ${BORD}`, borderRadius: 6,
                    color: TEXT, fontSize: 12, lineHeight: 1.45,
                    padding: '8px 10px', resize: 'none',
                    fontFamily: 'Arial, sans-serif', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />

                {/* Attach (top) + Send (bottom) stacked vertically */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    title="Attach image"
                    style={{ background: 'none', border: `1px solid ${BORD}`, borderRadius: 6, padding: '7px 8px', cursor: 'pointer', color: MUTED, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PaperclipIcon />
                  </button>
                  <button type="button" onClick={handleSend} disabled={thinking}
                    style={{ flex: 1, background: thinking ? SURF : TEAL, border: 'none', borderRadius: 6, padding: '7px 9px', cursor: thinking ? 'not-allowed' : 'pointer', color: thinking ? MUTED : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SendIcon />
                  </button>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <div style={{ marginTop: 4, fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'Arial, sans-serif' }}>
                Ctrl+Enter to send
              </div>
            </div>
          </>
        ) : (
          /* Collapsed icon */
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button type="button" onClick={onToggle} title="Open AI Tailor"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED, display: 'flex' }}>
              <SparkleIcon />
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* ============================
          Settings (collapsible)
          ============================ */}
      <div style={{ flexShrink: 0 }}>
        {open ? (
          <>
            {/* Accordion header */}
            <button type="button"
              onClick={() => setSettingsOpen(v => !v)}
              style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', color: MUTED, fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              <CogIcon />
              <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>
              {settingsOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </button>

            {settingsOpen && (
              <div style={{ padding: '0 10px 10px' }}>
                {/* Contact fields */}
                {([ ['Address', 'text',  addr,  setAddr  ],
                    ['Phone',   'tel',   phone, setPhone ],
                    ['Email',   'email', email, setEmail ],
                  ] as const).map(([lbl, type, val, set]) => (
                  <div key={lbl} style={{ marginBottom: 7 }}>
                    <div style={{ fontSize: 11, color: MUTED, marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>{lbl}</div>
                    <input
                      type={type}
                      value={val}
                      onChange={e => set(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', background: SURF, border: `1px solid ${BORD}`, borderRadius: 6, color: TEXT, fontSize: 12, padding: '7px 10px', fontFamily: 'Arial, sans-serif', outline: 'none' }}
                    />
                  </div>
                ))}

                {/* Divider */}
                <div style={{ height: 1, background: BORD, margin: '6px 0 8px' }} />

                {/* Gemini API key */}
                <div style={{ marginBottom: 7 }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 3, fontFamily: 'Arial, sans-serif' }}>Gemini API key</div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                    placeholder="AIza…"
                    style={{ width: '100%', boxSizing: 'border-box', background: SURF, border: `1px solid ${BORD}`, borderRadius: 6, color: TEXT, fontSize: 12, padding: '7px 10px', fontFamily: 'Arial, sans-serif', outline: 'none' }}
                  />
                </div>

                {/* Save button */}
                <button
                  type="button"
                  onClick={handleSave}
                  onMouseEnter={() => setHovSave(true)}
                  onMouseLeave={() => setHovSave(false)}
                  style={{
                    width: '100%', padding: '8px 0',
                    background: saved ? '#064e3b' : hovSave ? '#1f2937' : SURF,
                    color:      saved ? '#6ee7b7' : hovSave ? TEXT    : MUTED,
                    border: `1px solid ${saved ? '#065f46' : hovSave ? '#374151' : BORD}`,
                    borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    fontFamily: 'Arial, sans-serif',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                >
                  {saved ? '✓ Saved' : 'Save'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
            <button type="button" onClick={onToggle} title="Settings"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: MUTED }}>
              <CogIcon />
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* ============================
          Export PDF
          ============================ */}
      <div style={{ padding: open ? '10px 10px 12px' : '10px 0 12px', flexShrink: 0 }}>
        {open ? (
          <button type="button" onClick={onExport} disabled={exporting}
            style={{ width: '100%', padding: '9px 0', background: exporting ? SURF : TEAL, color: exporting ? MUTED : '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'Arial, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <DownloadIcon />
            {exporting ? 'Opening print…' : 'Export PDF'}
          </button>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button type="button" onClick={onExport} disabled={exporting} title="Export PDF"
              style={{ background: 'none', border: 'none', cursor: exporting ? 'not-allowed' : 'pointer', color: exporting ? MUTED : TEAL }}>
              <DownloadIcon />
            </button>
          </div>
        )}
      </div>

      {/* Footer + collapse toggle at the bottom */}
      <div style={{ flexShrink: 0, borderTop: `1px solid ${BORD}` }}>
        {open && (
          <div style={{ padding: '6px 14px 2px', fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'Arial, sans-serif' }}>
            Adedamola Michael · CV Editor
          </div>
        )}
        <button
          onClick={onToggle}
          title={open ? 'Collapse' : 'Expand'}
          style={{
            width: '100%', background: 'none', border: 'none',
            cursor: 'pointer', color: MUTED,
            padding: '8px 0',
            display: 'flex', alignItems: 'center',
            justifyContent: open ? 'flex-end' : 'center',
            paddingRight: open ? 14 : 0,
            gap: 6,
          }}
        >
          {open && <span style={{ fontSize: 10, fontFamily: 'Arial, sans-serif', letterSpacing: 0.5 }}>Collapse</span>}
          {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </button>
      </div>

      {/* Thinking animation keyframes */}
      <style>{`
        @keyframes cv-pulse {
          0%,100% { opacity:.3; transform:scale(.8); }
          50%      { opacity:1;  transform:scale(1.1); }
        }
      `}</style>
    </div>
  )
}
