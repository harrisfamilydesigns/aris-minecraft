import { useState, useRef } from 'react'
import InfiniteWorldGrid from './InfiniteWorldGrid'
import WorldBottomBar from './WorldBottomBar'

export default function WorldPanel({
  worldState,
  blocks,
  selectedBlock,
  isEraser,
  onWorldChange,
  onSelectBlock,
  onSelectEraser,
  onOpenSaveModal,
  onOpenSidebar,
  particlesRef,
}) {
  const [coord, setCoord] = useState({ col: 0, row: 0 })
  const coordTimerRef = useRef(null)
  const [coordVisible, setCoordVisible] = useState(false)

  function handleViewChange(c) {
    setCoord(c)
    setCoordVisible(true)
    clearTimeout(coordTimerRef.current)
    coordTimerRef.current = setTimeout(() => setCoordVisible(false), 2000)
  }

  function handleClear() {
    if (!window.confirm('Clear the entire world?')) return
    onWorldChange({})
  }

  return (
    <>
      <InfiniteWorldGrid
        worldState={worldState}
        blocks={blocks}
        selectedBlock={selectedBlock}
        isEraser={isEraser}
        onWorldChange={onWorldChange}
        onViewChange={handleViewChange}
        particlesRef={particlesRef}
      />

      {/* Coordinate indicator */}
      <div id="coord-display" className={coordVisible ? 'visible' : ''}>
        {coord.col},{coord.row}
      </div>

      <WorldBottomBar
        blocks={blocks}
        selectedBlock={selectedBlock}
        isEraser={isEraser}
        onSelectBlock={onSelectBlock}
        onSelectEraser={onSelectEraser}
        onSave={() => onOpenSaveModal('world')}
        onClear={handleClear}
        onOpenSidebar={onOpenSidebar}
      />
    </>
  )
}
