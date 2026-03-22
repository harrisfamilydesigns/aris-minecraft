import { useState, useRef, useMemo, useCallback } from 'react'
import { BUILT_IN_BLOCKS } from './lib/blocks'
import { playFanfare } from './lib/sounds'
import { useTemplates, useSaveTemplate, useDeleteTemplate } from './hooks/useTemplates'
import { useCustomBlocks, useSaveCustomBlock, useDeleteCustomBlock } from './hooks/useCustomBlocks'

import Clouds from './components/Clouds'
import Ground from './components/Ground'
import Header from './components/Header'
import ModeToggle from './components/ModeToggle'
import WorldPanel from './components/WorldPanel'
import BlockPanel from './components/BlockPanel'
import Sidebar from './components/Sidebar'
import SaveModal from './components/SaveModal'
import Particles from './components/Particles'
import CreeperPopup from './components/CreeperPopup'

const COLS = 18
const ROWS = 10
const BB_SIZE = 8

function emptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
}

function emptyBB() {
  return Array(BB_SIZE).fill(null).map(() => Array(BB_SIZE).fill(null))
}

// Defined outside App so its identity is stable — prevents CreeperPopup's useEffect timer
// from resetting on every App re-render while the popup is visible.
function CreeperPopupDismisser({ popup, onDone }) {
  const handleDone = useCallback(() => onDone(null), [onDone])
  return <CreeperPopup message={popup.message} style={popup.style} onDone={handleDone} />
}

export default function App() {
  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('world')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── World grid ────────────────────────────────────────────────────────────
  const [gridState, setGridState] = useState(emptyGrid)
  const [blockCount, setBlockCount] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState('grass')
  const [isEraser, setIsEraser] = useState(false)

  // ── Block builder ─────────────────────────────────────────────────────────
  const [bbState, setBBState] = useState(emptyBB)
  const [bbColor, setBBColor] = useState('#F9FFFE')
  const [bbEraser, setBBEraser] = useState(false)

  // ── Save modal ────────────────────────────────────────────────────────────
  const [saveModal, setSaveModal] = useState({ open: false, mode: 'world' })

  // ── Popup ─────────────────────────────────────────────────────────────────
  const [popup, setPopup] = useState(null)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const particlesRef = useRef(null)

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: customBlocksList = [] } = useCustomBlocks()
  const { data: templates = [] } = useTemplates()
  const saveTemplate = useSaveTemplate()
  const deleteTemplate = useDeleteTemplate()
  const saveCustomBlock = useSaveCustomBlock()
  const deleteCustomBlock = useDeleteCustomBlock()

  // Merge custom blocks into the blocks map
  const blocks = useMemo(() => {
    const custom = {}
    customBlocksList.forEach(cb => {
      custom[cb.key] = { name: cb.name, colors: cb.colors, isCustom: true }
    })
    return { ...BUILT_IN_BLOCKS, ...custom }
  }, [customBlocksList])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSelectBlock(key) {
    setIsEraser(false)
    setSelectedBlock(key)
  }

  function handleLoadTemplate(idx) {
    const tpl = templates[idx]
    if (!tpl) return
    const next = emptyGrid()
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (tpl.state[r]?.[c]) next[r][c] = tpl.state[r][c]
    setGridState(next)
    setBlockCount(next.flat().filter(Boolean).length)
    setMode('world')
    setPopup({
      message: tpl.name + ' loaded!',
      style: { fontSize: '14px', color: '#FFD700', textShadow: '2px 2px 0 #000' },
    })
  }

  async function handleSave(name) {
    setSaveModal({ open: false, mode: 'world' })
    if (saveModal.mode === 'block') {
      const key = 'custom_' + Date.now()
      const colors = bbState.map(row => [...row])
      await saveCustomBlock.mutateAsync({ key, name, colors })
      setBBState(emptyBB())
      setMode('world')
      handleSelectBlock(key)
      playFanfare()
      setPopup({
        message: name + ' added!',
        style: { fontSize: '14px', color: '#FFD700', textShadow: '2px 2px 0 #000' },
      })
    } else {
      const snapshot = gridState.map(row => [...row])
      await saveTemplate.mutateAsync({ name, state: snapshot })
      playFanfare()
    }
  }

  async function handleDeleteCustomBlock(key) {
    await deleteCustomBlock.mutateAsync(key)
    if (selectedBlock === key) {
      setSelectedBlock('grass')
      setIsEraser(false)
    }
  }

  async function handleDeleteTemplate(id) {
    await deleteTemplate.mutateAsync(id)
  }

  return (
    <>
      <Clouds />
      <div id="main-content">
        <Header />
        <ModeToggle mode={mode} setMode={setMode} />
        {mode === 'world' && (
          <WorldPanel
            blocks={blocks}
            selectedBlock={selectedBlock}
            isEraser={isEraser}
            gridState={gridState}
            blockCount={blockCount}
            onGridChange={setGridState}
            onBlockCountChange={setBlockCount}
            onSelectBlock={handleSelectBlock}
            onSelectEraser={() => { setIsEraser(true); setSelectedBlock(null) }}
            onOpenSaveModal={m => setSaveModal({ open: true, mode: m })}
            onDeleteCustomBlock={handleDeleteCustomBlock}
            onPopup={setPopup}
            particlesRef={particlesRef}
          />
        )}
        {mode === 'block' && (
          <BlockPanel
            bbState={bbState}
            onBBChange={setBBState}
            selectedColor={bbColor}
            isEraser={bbEraser}
            onSelectColor={c => { setBBColor(c); setBBEraser(false) }}
            onSelectEraser={() => setBBEraser(true)}
            onOpenSaveModal={m => setSaveModal({ open: true, mode: m })}
          />
        )}
      </div>
      {sidebarOpen && <div id="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <button id="sidebar-toggle" onClick={() => setSidebarOpen(o => !o)}>📦 MY BUILDS</button>
      <Sidebar
        templates={templates}
        blocks={blocks}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Particles ref={particlesRef} />
      <Ground />
      <SaveModal
        isOpen={saveModal.open}
        pendingMode={saveModal.mode}
        templateCount={templates.length}
        customBlockCount={customBlocksList.length}
        onSave={handleSave}
        onCancel={() => setSaveModal({ open: false, mode: 'world' })}
      />
      {popup && (
        <CreeperPopupDismisser popup={popup} onDone={setPopup} />
      )}
    </>
  )
}
