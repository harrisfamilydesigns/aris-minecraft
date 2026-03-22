import Score from './Score'
import Toolbar from './Toolbar'
import WorldGrid from './WorldGrid'
import { playExplosion } from '../lib/sounds'

const COLS = 18
const ROWS = 10

// ── Surprise drawings ──────────────────────────────────────────────────────
function applyCreeper(state) {
  const next = state.map(row => [...row])
  const ox = 6, oy = 1
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) next[oy + r][ox + c] = 'leaves'
  next[oy+1][ox+1]='dirt';next[oy+1][ox+3]='dirt';next[oy+2][ox+2]='dirt'
  next[oy+3][ox+1]='dirt';next[oy+3][ox+2]='dirt';next[oy+3][ox+3]='dirt'
  for (let r = 4; r < 8; r++) for (let c = 1; c < 4; c++) next[oy+r][ox+c] = 'leaves'
  next[oy+8][ox+1]='leaves';next[oy+8][ox+3]='leaves'
  return next
}
function applyPig(state) {
  const next = state.map(row => [...row])
  const ox = 6, oy = 2
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) next[oy+r][ox+c] = 'dirt'
  next[oy][ox+1]='stone';next[oy][ox+3]='stone';next[oy+1][ox+2]='wood'
  next[oy+2][ox+1]='wood';next[oy+2][ox+2]='wood';next[oy+2][ox+3]='wood'
  for (let r = 3; r < 6; r++) for (let c = 0; c < 5; c++) next[oy+r][ox+c] = 'dirt'
  next[oy+6][ox]='dirt';next[oy+6][ox+1]='dirt';next[oy+6][ox+3]='dirt';next[oy+6][ox+4]='dirt'
  return next
}
function applySteve(state) {
  const next = state.map(row => [...row])
  const ox = 7, oy = 0
  for (let c = 0; c < 4; c++) next[oy][ox+c] = 'wood'
  next[oy+1][ox]='wood';next[oy+1][ox+1]='dirt';next[oy+1][ox+2]='dirt';next[oy+1][ox+3]='wood'
  next[oy+2][ox]='dirt';next[oy+2][ox+1]='water';next[oy+2][ox+2]='water';next[oy+2][ox+3]='dirt'
  for (let c = 0; c < 4; c++) next[oy+3][ox+c] = 'dirt'
  for (let r = 4; r < 7; r++) for (let c = 0; c < 4; c++) next[oy+r][ox+c] = 'water'
  for (let r = 7; r < 9; r++) for (let c = 0; c < 4; c++) next[oy+r][ox+c] = 'stone'
  for (let c = 0; c < 4; c++) next[oy+9][ox+c] = 'wood'
  return next
}
function applyHouse(state) {
  const next = state.map(row => [...row])
  const ox = 4, oy = 3
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) next[oy+r][ox+c] = 'wood'
  next[oy+3][ox+4]='dirt';next[oy+4][ox+4]='dirt'
  next[oy+2][ox+2]='water';next[oy+2][ox+6]='water'
  ;[[1,2,3,4,5,6,7],[2,3,4,5,6],[3,4,5],[4]].forEach((cols, ri) =>
    cols.forEach(c => { if (oy-1-ri >= 0) next[oy-1-ri][ox+c] = 'stone' }))
  return next
}
function applyTree(state) {
  const next = state.map(row => [...row])
  const ox = 8, oy = 0
  for (let r = 0; r < 4; r++) {
    const w = r < 2 ? 5 : 3, off = r < 2 ? -2 : -1
    for (let c = 0; c < w; c++) next[oy+r][ox+off+c] = 'leaves'
  }
  for (let r = 4; r < 9; r++) next[oy+r][ox] = 'wood'
  for (let c = ox-3; c <= ox+3; c++) if (c >= 0 && c < COLS) next[9][c] = 'grass'
  return next
}

const SURPRISES = [
  { fn: applyCreeper, name: 'Creeper!' },
  { fn: applyPig,     name: 'Pig!' },
  { fn: applySteve,   name: 'Steve!' },
  { fn: applyHouse,   name: 'House!' },
  { fn: applyTree,    name: 'Tree!' },
]

export function countBlocks(state) {
  return state.flat().filter(Boolean).length
}

export default function WorldPanel({
  blocks,
  selectedBlock,
  isEraser,
  gridState,
  blockCount,
  onGridChange,
  onBlockCountChange,
  onSelectBlock,
  onSelectEraser,
  onOpenSaveModal,
  onDeleteCustomBlock,
  onPopup,
  particlesRef,
}) {
  function handleClear() {
    playExplosion()
    const empty = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    onGridChange(empty)
    onBlockCountChange(0)
    particlesRef.current?.spawnExplosion()
  }

  function handleSurprise() {
    playExplosion()
    const empty = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    const idx = Math.floor(Math.random() * SURPRISES.length)
    const { fn, name } = SURPRISES[idx]
    const next = fn(empty)
    onGridChange(next)
    onBlockCountChange(countBlocks(next))
    particlesRef.current?.spawnExplosion()
    onPopup({ message: name, style: { fontSize: '24px', color: '#fff', textShadow: '3px 3px 0 #000' } })
  }

  function handleSpawnParticles(cellEl) {
    const colors = selectedBlock && blocks[selectedBlock]?.colors[0]
    particlesRef.current?.spawn(cellEl, colors)
  }

  return (
    <div id="world-panel">
      <Score count={blockCount} />
      <Toolbar
        blocks={blocks}
        selectedBlock={selectedBlock}
        onSelect={onSelectBlock}
        onDelete={onDeleteCustomBlock}
      />
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
        <button className="ctrl-btn btn-surprise" onClick={handleSurprise}>⭐ SURPRISE!</button>
        <button className="ctrl-btn btn-save" onClick={() => onOpenSaveModal('world')}>💾 SAVE</button>
        <button className="ctrl-btn btn-clear" onClick={handleClear}>💥 CLEAR</button>
      </div>
      <WorldGrid
        gridState={gridState}
        onGridChange={onGridChange}
        blocks={blocks}
        selectedBlock={selectedBlock}
        isEraser={isEraser}
        onBlockCountChange={onBlockCountChange}
        onSpawnParticles={handleSpawnParticles}
      />
    </div>
  )
}
