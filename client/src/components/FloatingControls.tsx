/* ===================================
   FloatingControls.tsx
   -----------------------------------
   - FAB stack: bottom-left, stacked vertically.
   - Order (bottom to top): Export PDF, AI Tailor, Settings.
   =================================== */

interface Props {
  onExport: () => void
  onChat: () => void
  onSettings: () => void
  exporting: boolean
  pendingCount: number
  chatOpen: boolean
}

export function FloatingControls({ onExport, onChat, onSettings, exporting, pendingCount, chatOpen }: Props) {
  const btnBase: React.CSSProperties = {
    width: 52,
    height: 52,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20,
    boxShadow: '0 3px 12px rgba(0,0,0,0.35)',
    position: 'relative',
    flexShrink: 0,
    transition: 'transform 0.15s, background 0.15s',
  }

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: 12,
        zIndex: 500,
      }}
    >
      {/* =============================
          Export PDF — bottom
          ============================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onExport}
          disabled={exporting}
          title="Export PDF"
          style={{
            ...btnBase,
            background: exporting ? '#aaa' : '#1bb5b6',
            color: '#fff',
          }}
        >
          {exporting ? '⏳' : '⬇'}
        </button>
        <Label text="Export PDF" />
      </div>

      {/* =============================
          AI Tailor — middle
          ============================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onChat}
          title="AI Tailor"
          style={{
            ...btnBase,
            background: chatOpen ? '#0d8a8b' : '#1bb5b6',
            color: '#fff',
          }}
        >
          ✦
          {pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 2, right: 2,
              width: 18, height: 18,
              borderRadius: '50%',
              background: '#ff4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {pendingCount}
            </span>
          )}
        </button>
        <Label text="AI Tailor" />
      </div>

      {/* =============================
          Settings — top
          ============================= */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={onSettings}
          title="Settings"
          style={{
            ...btnBase,
            background: '#333',
            color: '#ccc',
          }}
        >
          ⚙
        </button>
        <Label text="Settings" />
      </div>
    </div>
  )
}

// Small tooltip label on hover (always visible on the right side of each button)
function Label({ text }: { text: string }) {
  return (
    <span style={{
      position: 'absolute',
      left: 60,
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'rgba(0,0,0,0.72)',
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 4,
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      fontFamily: 'Arial, sans-serif',
      letterSpacing: 0.3,
    }}>
      {text}
    </span>
  )
}
