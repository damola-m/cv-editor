/* ===================================
   App.tsx
   -----------------------------------
   - Root layout: collapsible sidebar + CV canvas.
   =================================== */
import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { CVCanvas } from './components/CVCanvas'
import { useCVState } from './hooks/useCVState'
import { exportPDF } from './utils/pdfExport'

export default function App() {
  const {
    cv, pending, queuePatches, applyPatch, rejectPatch,
    updateContact, persistSettings, resetToDefault, loadVersion,
  } = useCVState()

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
        onReset={resetToDefault}
        onLoadVersion={loadVersion}
      />
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <CVCanvas data={cv} />
      </div>
    </div>
  )
}
