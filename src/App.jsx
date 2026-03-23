import { useState, useRef, useMemo, useCallback } from 'react'
import { BUILT_IN_BLOCKS } from './lib/blocks'
import { playFanfare } from './lib/sounds'
import { useTemplates, useSaveTemplate, useDeleteTemplate } from './hooks/useTemplates'
import { useCustomBlocks, useSaveCustomBlock, useDeleteCustomBlock } from './hooks/useCustomBlocks'

import Clouds from './components/Clouds'
import ModeToggle from './components/ModeToggle'
import WorldPanel from './components/WorldPanel'
import BlockPanel from './components/BlockPanel'
import BlockBottomBar from './components/BlockBottomBar'
import BlockTemplateDrawer from './components/BlockTemplateDrawer'
import Sidebar from './components/Sidebar'
import SaveModal from './components/SaveModal'
import Particles from './components/Particles'
import CreeperPopup from './components/CreeperPopup'

const BB_SIZE = 8

function emptyBB(size = 8) {
  return Array(size).fill(null).map(() => Array(size).fill(null))
}

function scaleUp(grid) {
  return Array.from({ length: 16 }, (_, r) =>
    Array.from({ length: 16 }, (_, c) => grid[Math.floor(r / 2)][Math.floor(c / 2)])
  )
}

function scaleDown(grid) {
  return Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => grid[r * 2][c * 2])
  )
}

// Convert old 2D-array template format to new sparse-object format
function normaliseWorldState(state) {
  if (!state) return {}
  if (!Array.isArray(state)) return state  // already new format
  const result = {}
  state.forEach((row, r) => {
    if (!Array.isArray(row)) return
    row.forEach((block, c) => {
      if (block) result[`${r},${c}`] = block
    })
  })
  return result
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
  const [blockDrawerOpen, setBlockDrawerOpen] = useState(false)

  // ── World (sparse object: "r,c" → blockKey) ───────────────────────────────
  const [worldState, setWorldState] = useState({})
  const [selectedBlock, setSelectedBlock] = useState('grass')
  const [isEraser, setIsEraser] = useState(false)

  // ── Block builder ─────────────────────────────────────────────────────────
  const [bbState, setBBState] = useState(emptyBB)
  const [bbResolution, setBBResolution] = useState(8)
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
    const normalised = normaliseWorldState(tpl.state)
    setWorldState(normalised)
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
      setBBResolution(8)
      setMode('world')
      handleSelectBlock(key)
      playFanfare()
      setPopup({
        message: name + ' added!',
        style: { fontSize: '14px', color: '#FFD700', textShadow: '2px 2px 0 #000' },
      })
    } else {
      await saveTemplate.mutateAsync({ name, state: worldState })
      playFanfare()
    }
  }

  function handleLoadBBTemplate(colors) {
    setBBState(colors.map(row => [...row]))
    setBBResolution(colors.length)
  }

  function handleToggleBBResolution() {
    if (bbResolution === 8) {
      setBBState(prev => scaleUp(prev))
      setBBResolution(16)
    } else {
      setBBState(prev => scaleDown(prev))
      setBBResolution(8)
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
      {mode === 'world' ? (
        <WorldPanel
          worldState={worldState}
          blocks={blocks}
          selectedBlock={selectedBlock}
          isEraser={isEraser}
          onWorldChange={setWorldState}
          onSelectBlock={handleSelectBlock}
          onSelectEraser={() => setIsEraser(true)}
          onOpenSaveModal={m => setSaveModal({ open: true, mode: m })}
          onDeleteCustomBlock={handleDeleteCustomBlock}
          onOpenSidebar={() => setSidebarOpen(o => !o)}
          particlesRef={particlesRef}
        />
      ) : (
        <div id="main-content">
          <BlockPanel
            bbState={bbState}
            bbResolution={bbResolution}
            onBBChange={setBBState}
            selectedColor={bbColor}
            isEraser={bbEraser}
            onSelectColor={c => { setBBColor(c); setBBEraser(false) }}
          />
          <BlockBottomBar
            selectedColor={bbColor}
            isEraser={bbEraser}
            bbResolution={bbResolution}
            onSelectColor={c => { setBBColor(c); setBBEraser(false) }}
            onSelectEraser={() => setBBEraser(true)}
            onFill={() => {
              if (bbEraser) return
              if (!window.confirm('Fill entire canvas with this color?')) return
              setBBState(Array(bbResolution).fill(null).map(() => Array(bbResolution).fill(bbColor)))
            }}
            onClear={() => {
              setBBState(Array(bbResolution).fill(null).map(() => Array(bbResolution).fill(null)))
            }}
            onSave={() => setSaveModal({ open: true, mode: 'block' })}
            onToggleResolution={handleToggleBBResolution}
            onOpenTemplates={() => setBlockDrawerOpen(true)}
          />
          <BlockTemplateDrawer
            customBlocks={customBlocksList}
            isOpen={blockDrawerOpen}
            onClose={() => setBlockDrawerOpen(false)}
            onLoad={handleLoadBBTemplate}
            onDelete={handleDeleteCustomBlock}
          />
        </div>
      )}

      <ModeToggle mode={mode} setMode={setMode} floating />

      {sidebarOpen && <div id="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      {blockDrawerOpen && <div id="sidebar-backdrop" onClick={() => setBlockDrawerOpen(false)} />}
      <Sidebar
        templates={templates}
        blocks={blocks}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Particles ref={particlesRef} />

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
