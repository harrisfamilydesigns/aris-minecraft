import { useRef, useEffect } from 'react'

const CELL_SIZE = 32  // pixels per cell at zoom=1
const MIN_ZOOM = 0.15
const MAX_ZOOM = 8

function initialZoom(w) {
  // Show ~18 cells across any screen width
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, w / (18 * CELL_SIZE)))
}

export default function InfiniteWorldGrid({
  worldState,
  blocks,
  selectedBlock,
  isEraser,
  onWorldChange,
  onViewChange,
  particlesRef,
}) {
  const canvasRef = useRef(null)
  const panRef = useRef({ x: 4, y: 4 })
  // Zoom is computed post-layout in onResize; use a safe fallback here.
  const zoomRef = useRef(initialZoom(window.innerWidth || 390))
  const blockCacheRef = useRef(new Map())
  const rafRef = useRef(null)
  const scheduleRenderRef = useRef(null)

  // Keep latest prop values in refs so canvas callbacks never go stale
  const worldStateRef = useRef(worldState)
  worldStateRef.current = worldState
  const blocksRef = useRef(blocks)
  blocksRef.current = blocks
  const selectedBlockRef = useRef(selectedBlock)
  selectedBlockRef.current = selectedBlock
  const isEraserRef = useRef(isEraser)
  isEraserRef.current = isEraser
  const onWorldChangeRef = useRef(onWorldChange)
  onWorldChangeRef.current = onWorldChange
  const onViewChangeRef = useRef(onViewChange)
  onViewChangeRef.current = onViewChange
  const particlesRefRef = useRef(particlesRef)
  particlesRefRef.current = particlesRef

  // Clear block image cache whenever block definitions change
  useEffect(() => {
    blockCacheRef.current.clear()
    scheduleRenderRef.current?.()
  }, [blocks])

  // Trigger re-render when world state changes
  useEffect(() => {
    scheduleRenderRef.current?.()
  }, [worldState])

  // Main imperative setup — registered once, reads refs to stay fresh
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function scheduleRender() {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        renderCanvas()
      })
    }
    scheduleRenderRef.current = scheduleRender

    function getBlockImage(key, block) {
      let img = blockCacheRef.current.get(key)
      if (!img) {
        const { colors } = block
        const sz = colors.length
        img = document.createElement('canvas')
        img.width = img.height = sz
        const tc = img.getContext('2d')
        tc.imageSmoothingEnabled = false
        for (let py = 0; py < sz; py++)
          for (let px = 0; px < sz; px++) {
            if (!colors[py][px]) continue
            tc.fillStyle = colors[py][px]
            tc.fillRect(px, py, 1, 1)
          }
        blockCacheRef.current.set(key, img)
      }
      return img
    }

    function renderCanvas() {
      const w = canvas.width
      const h = canvas.height
      const ctx = canvas.getContext('2d')
      const { x: panX, y: panY } = panRef.current
      const zoom = zoomRef.current
      const cellPx = CELL_SIZE * zoom

      ctx.imageSmoothingEnabled = false
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = 'transparent'
      ctx.fillRect(0, 0, w, h)

      const minCol = Math.floor(-panX / cellPx) - 1
      const maxCol = Math.ceil((w - panX) / cellPx) + 1
      const minRow = Math.floor(-panY / cellPx) - 1
      const maxRow = Math.ceil((h - panY) / cellPx) + 1

      // Grid lines at reasonable zoom levels
      if (zoom > 0.3) {
        ctx.strokeStyle = 'rgba(0,0,0,0.07)'
        ctx.lineWidth = 1
        ctx.beginPath()
        for (let c = minCol; c <= maxCol + 1; c++) {
          const x = Math.round(c * cellPx + panX) + 0.5
          ctx.moveTo(x, 0); ctx.lineTo(x, h)
        }
        for (let r = minRow; r <= maxRow + 1; r++) {
          const y = Math.round(r * cellPx + panY) + 0.5
          ctx.moveTo(0, y); ctx.lineTo(w, y)
        }
        ctx.stroke()
      }

      // Blocks
      const ws = worldStateRef.current
      const bl = blocksRef.current
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          const bt = ws[`${r},${c}`]
          if (!bt || !bl[bt]) continue
          const sx = c * cellPx + panX
          const sy = r * cellPx + panY
          ctx.drawImage(getBlockImage(bt, bl[bt]), sx, sy, cellPx, cellPx)
        }
      }

      // Report top-left coordinate
      const tlCol = Math.floor(-panX / cellPx)
      const tlRow = Math.floor(-panY / cellPx)
      onViewChangeRef.current?.({ col: tlCol, row: tlRow })
    }

    function screenToCell(sx, sy) {
      const cellPx = CELL_SIZE * zoomRef.current
      return {
        col: Math.floor((sx - panRef.current.x) / cellPx),
        row: Math.floor((sy - panRef.current.y) / cellPx),
      }
    }

    function paintCell(row, col, sx, sy) {
      const key = `${row},${col}`
      const ws = worldStateRef.current
      if (isEraserRef.current) {
        if (!ws[key]) return
        onWorldChangeRef.current(prev => {
          const { [key]: _, ...next } = prev
          return next
        })
      } else {
        const sel = selectedBlockRef.current
        if (!sel) return
        if (ws[key] === sel) return
        const p = particlesRefRef.current?.current
        if (p?.spawnAt && sx != null) {
          const colors = blocksRef.current[sel]?.colors?.[0]
          p.spawnAt(sx, sy, colors)
        }
        onWorldChangeRef.current(prev => ({ ...prev, [key]: sel }))
      }
    }

    // ── Touch ────────────────────────────────────────────────────────────────
    // Never paint in touchstart — wait until touchmove (drag) or touchend (tap).
    // Once two fingers are seen in a gesture, suppress all painting for that gesture.
    let startCell = null    // cell where first finger landed
    let startSx = 0         // screen coords of that touch (for particles)
    let startSy = 0
    let lastCell = null     // last cell painted (drag deduplication)
    let multiTouchSeen = false  // true if ≥2 fingers touched this gesture
    let paintedThisGesture = false  // true if we already painted ≥1 cell
    let pinchState = null

    function dist(t1, t2) {
      return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
    }

    function resetGesture() {
      startCell = null
      lastCell = null
      multiTouchSeen = false
      paintedThisGesture = false
      pinchState = null
    }

    function onTouchStart(e) {
      e.preventDefault()
      if (e.touches.length === 1) {
        resetGesture()
        const { clientX: sx, clientY: sy } = e.touches[0]
        startSx = sx; startSy = sy
        startCell = screenToCell(sx, sy)
        lastCell = startCell
        // Do NOT paint yet — wait for move or end to distinguish tap from pinch
      } else if (e.touches.length >= 2) {
        // Second finger arrived — this is a pinch/pan gesture, not a paint gesture
        multiTouchSeen = true
        const t1 = e.touches[0], t2 = e.touches[1]
        pinchState = {
          dist: dist(t1, t2),
          panX: panRef.current.x, panY: panRef.current.y,
          zoom: zoomRef.current,
          midX: (t1.clientX + t2.clientX) / 2,
          midY: (t1.clientY + t2.clientY) / 2,
        }
      }
    }

    function onTouchMove(e) {
      e.preventDefault()
      if (e.touches.length === 1 && !multiTouchSeen) {
        const { clientX: sx, clientY: sy } = e.touches[0]
        const cell = screenToCell(sx, sy)
        if (!lastCell || lastCell.row !== cell.row || lastCell.col !== cell.col) {
          // First movement across a cell boundary — paint the start cell first
          if (!paintedThisGesture && startCell) {
            paintCell(startCell.row, startCell.col, startSx, startSy)
            paintedThisGesture = true
          }
          lastCell = cell
          paintCell(cell.row, cell.col, sx, sy)
          paintedThisGesture = true
        }
      } else if (e.touches.length >= 2 && pinchState) {
        multiTouchSeen = true
        const t1 = e.touches[0], t2 = e.touches[1]
        const newDist = dist(t1, t2)
        const newMidX = (t1.clientX + t2.clientX) / 2
        const newMidY = (t1.clientY + t2.clientY) / 2
        const { dist: d0, panX, panY, zoom, midX, midY } = pinchState

        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * (newDist / d0)))
        // Keep world point under original midpoint fixed, then follow new midpoint
        const worldMidX = (midX - panX) / (CELL_SIZE * zoom)
        const worldMidY = (midY - panY) / (CELL_SIZE * zoom)
        panRef.current = {
          x: newMidX - worldMidX * CELL_SIZE * newZoom,
          y: newMidY - worldMidY * CELL_SIZE * newZoom,
        }
        zoomRef.current = newZoom
        scheduleRender()
      }
    }

    function onTouchEnd(e) {
      e.preventDefault()
      if (e.touches.length === 0) {
        // All fingers lifted — if this was a clean single-finger tap, paint now
        if (!multiTouchSeen && !paintedThisGesture && startCell) {
          paintCell(startCell.row, startCell.col, startSx, startSy)
        }
        resetGesture()
      } else if (e.touches.length === 1) {
        // One finger of a pinch released — don't resume painting with remaining finger
        resetGesture()
      }
    }

    // ── Mouse (desktop) ──────────────────────────────────────────────────────
    let mouseDown = false
    let mouseLastCell = null

    function onMouseDown(e) {
      if (e.button !== 0) return
      mouseDown = true
      const cell = screenToCell(e.clientX, e.clientY)
      mouseLastCell = cell
      paintCell(cell.row, cell.col, e.clientX, e.clientY)
    }

    function onMouseMove(e) {
      if (!mouseDown) return
      const cell = screenToCell(e.clientX, e.clientY)
      if (!mouseLastCell || mouseLastCell.row !== cell.row || mouseLastCell.col !== cell.col) {
        mouseLastCell = cell
        paintCell(cell.row, cell.col, e.clientX, e.clientY)
      }
    }

    function onMouseUp() {
      mouseDown = false
      mouseLastCell = null
    }

    function onWheel(e) {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom on trackpad sends ctrlKey=true
        const factor = e.deltaY < 0 ? 1.1 : 0.9
        applyZoom(factor, e.clientX, e.clientY)
      } else {
        panRef.current = {
          x: panRef.current.x - e.deltaX,
          y: panRef.current.y - e.deltaY,
        }
        scheduleRender()
      }
    }

    function applyZoom(factor, cx, cy) {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomRef.current * factor))
      const worldX = (cx - panRef.current.x) / (CELL_SIZE * zoomRef.current)
      const worldY = (cy - panRef.current.y) / (CELL_SIZE * zoomRef.current)
      panRef.current = {
        x: cx - worldX * CELL_SIZE * newZoom,
        y: cy - worldY * CELL_SIZE * newZoom,
      }
      zoomRef.current = newZoom
      scheduleRender()
    }

    // ── Resize ───────────────────────────────────────────────────────────────
    let sizedOnce = false
    function onResize() {
      const w = window.innerWidth || 390
      const h = window.innerHeight || 600
      // Set dimensions first so canvas.width is authoritative.
      canvas.width = w
      canvas.height = h
      // On first resize, compute zoom so ~18 cells fit across the canvas.
      // Deriving from canvas.width (not a pre-layout window measure) ensures the
      // cell count is correct regardless of DPR or viewport timing quirks.
      if (!sizedOnce) {
        zoomRef.current = initialZoom(canvas.width)
        sizedOnce = true
      }
      scheduleRender()
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd, { passive: false })
    canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    window.addEventListener('resize', onResize)

    // Defer to next frame so CSS (position:fixed; inset:0) is applied before
    // we read canvas.clientWidth/Height for the initial size calculation.
    const initRaf = requestAnimationFrame(onResize)

    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
      canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(initRaf)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <canvas ref={canvasRef} id="infinite-canvas" />
}
