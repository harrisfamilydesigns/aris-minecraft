import { useRef, useCallback, useEffect } from 'react'

const BB_SIZE = 8

export default function BBGrid({ bbState, onBBChange, selectedColor, isEraser }) {
  const isMouseDown = useRef(false)

  const paint = useCallback((r, c) => {
    const color = isEraser ? null : selectedColor
    const next = bbState.map(row => [...row])
    next[r][c] = color
    onBBChange(next)
  }, [bbState, onBBChange, selectedColor, isEraser])

  useEffect(() => {
    const up = () => { isMouseDown.current = false }
    document.addEventListener('mouseup', up)
    return () => document.removeEventListener('mouseup', up)
  }, [])

  const cells = []
  for (let r = 0; r < BB_SIZE; r++) {
    for (let c = 0; c < BB_SIZE; c++) {
      const color = bbState[r][c]
      cells.push(
        <div
          key={`${r}-${c}`}
          className="bb-cell"
          style={{ background: color ?? '' }}
          onMouseDown={e => { isMouseDown.current = true; paint(r, c); e.preventDefault() }}
          onMouseEnter={() => { if (isMouseDown.current) paint(r, c) }}
          onTouchStart={e => { paint(r, c); e.preventDefault() }}
        />
      )
    }
  }

  const bbCellSize = Math.min(40, Math.floor((window.innerWidth - 25) / BB_SIZE))

  return (
    <div className="bb-grid-container">
      <div
        className="bb-grid"
        style={{
          gridTemplateColumns: `repeat(${BB_SIZE}, ${bbCellSize}px)`,
          gridTemplateRows: `repeat(${BB_SIZE}, ${bbCellSize}px)`,
          '--bb-cell-size': `${bbCellSize}px`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}
