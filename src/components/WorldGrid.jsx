import React, { useEffect, useRef, useCallback } from 'react'
import { drawBlock } from '../lib/blocks'
import { playPlaceSound } from '../lib/sounds'

const COLS = 18
const ROWS = 10

function cellBg(r) {
  return `rgba(135,206,235,${0.3 - r * 0.02})`
}

export default function WorldGrid({
  gridState,
  onGridChange,
  blocks,
  selectedBlock,
  isEraser,
  onBlockCountChange,
  onSpawnParticles,
}) {
  const isMouseDown = useRef(false)

  const paint = useCallback((r, c, cellEl) => {
    if (isEraser) {
      if (gridState[r][c]) {
        const next = gridState.map(row => [...row])
        next[r][c] = null
        onGridChange(next)
        onBlockCountChange(count => Math.max(0, count - 1))
      }
      return  // no particles when erasing
    }
    if (!selectedBlock) return
    if (gridState[r][c] === selectedBlock) return
    const next = gridState.map(row => [...row])
    const isNew = !next[r][c]
    next[r][c] = selectedBlock
    onGridChange(next)
    if (isNew) onBlockCountChange(count => count + 1)
    playPlaceSound()
    // Only spawn particles when actually placing a block (not erasing)
    if (cellEl) onSpawnParticles(cellEl)
  }, [gridState, onGridChange, selectedBlock, isEraser, onBlockCountChange, onSpawnParticles])

  useEffect(() => {
    const up = () => { isMouseDown.current = false }
    document.addEventListener('mouseup', up)
    return () => document.removeEventListener('mouseup', up)
  }, [])

  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const blockType = gridState[r][c]
      cells.push(
        <Cell
          key={`${r}-${c}`}
          r={r} c={c}
          blockType={blockType}
          blocks={blocks}
          isMouseDown={isMouseDown}
          onPaint={paint}
        />
      )
    }
  }

  return (
    <div className="grid-container">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 34px)`,
          gridTemplateRows: `repeat(${ROWS}, 34px)`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}

// React.memo prevents all 180 cells re-rendering on every paint stroke
const Cell = React.memo(function Cell({ r, c, blockType, blocks, isMouseDown, onPaint }) {
  const canvasRef = useRef(null)
  const divRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (blockType && blocks[blockType]) {
      if (!canvas) return
      drawBlock(canvas, blockType, blocks)
    }
  }, [blockType, blocks])

  const bg = blockType ? 'transparent' : cellBg(r)

  return (
    <div
      ref={divRef}
      className="cell"
      style={{ background: bg }}
      onMouseDown={e => {
        isMouseDown.current = true
        onPaint(r, c, divRef.current)
        e.preventDefault()
      }}
      onMouseEnter={() => {
        if (isMouseDown.current) onPaint(r, c, divRef.current)
      }}
      onTouchStart={e => {
        onPaint(r, c, divRef.current)
        e.preventDefault()
      }}
    >
      {blockType && blocks[blockType] && <canvas ref={canvasRef} />}
    </div>
  )
})
