/* ===================================
   App.tsx
   -----------------------------------
   - Root layout: collapsible sidebar on the left,
     CV canvas filling the remaining space.
   =================================== */
import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { CVCanvas } from './components/CVCanvas'
import { useCVState } from './hooks/useCVState'
import { exportPDF } from './utils/pdfExport'

export default function App() {
  const { cv, pending, queuePatches, applyPatch, rejectPatch, updateContact, persistSettings } = useCVState()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [exporting,   setExporting]   = useState(false)

  async function handleExport() {
    setExporting(true)
    try {
      await exportPDF()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>

      {/* =============================
          Part 1 — Collapsible sidebar
          ============================= */}
      <Sidebar
        cv={cv}
        pending={pending}
        onPatches={queuePatches}
        onApply={applyPatch}
        onReject={rejectPatch}
        onExport={handleExport}
        exporting={exporting}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
        onContactChange={updateContact}
        onPersist={persistSettings}
      />

      {/* =============================
          Part 2 — CV canvas (flex:1 fills remaining width)
          CVCanvas reads its own container width, so it
          re-scales automatically when sidebar opens/closes.
          ============================= */}
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <CVCanvas data={cv} />
      </div>

    </div>
  )
}
