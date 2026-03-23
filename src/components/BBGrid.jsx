import { useRef, useCallback, useEffect, useState } from 'react'

export default function BBGrid({ bbState, bbSize = 8, onBBChange, selectedColor, isEraser }) {
  const isMouseDown = useRef(false)
  const [, setTick] = useState(0)

  useEffect(() => {
    const onResize = () => setTick(t => t + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

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
  for (let r = 0; r < bbSize; r++) {
    for (let c = 0; c < bbSize; c++) {
      const color = bbState[r]?.[c]
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

  const availableH = window.innerHeight - 168 // top toggle ~52 + bottom bar ~64 + used row ~44 + padding
  const bbCellSize = Math.min(
    40,
    Math.floor((window.innerWidth - 25) / bbSize),
    Math.floor(availableH / bbSize),
  )

  return (
    <div className="bb-grid-container">
      <div
        className="bb-grid"
        style={{
          gridTemplateColumns: `repeat(${bbSize}, ${bbCellSize}px)`,
          gridTemplateRows: `repeat(${bbSize}, ${bbCellSize}px)`,
          '--bb-cell-size': `${bbCellSize}px`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}
