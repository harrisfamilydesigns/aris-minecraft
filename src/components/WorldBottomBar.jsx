import { useEffect, useRef, useState } from 'react'
import { drawBlock } from '../lib/blocks'

function BlockBtn({ blockKey, block, isSelected, onSelect, onDelete, scrollingRef }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) drawBlock(canvasRef.current, blockKey, { [blockKey]: block })
  }, [blockKey, block])

  return (
    <div
      className={`block-btn${isSelected ? ' selected' : ''}`}
      onClick={() => onSelect(blockKey)}
      onTouchEnd={e => {
        if (scrollingRef.current) return
        e.preventDefault()
        onSelect(blockKey)
      }}
    >
      <canvas ref={canvasRef} />
      {block.isCustom && (
        <span
          className="custom-del"
          onClick={e => { e.stopPropagation(); onDelete(blockKey) }}
          onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onDelete(blockKey) }}
        >×</span>
      )}
    </div>
  )
}

export default function WorldBottomBar({
  blocks,
  selectedBlock,
  isEraser,
  onSelectBlock,
  onSelectEraser,
  onSave,
  onClear,
  onOpenSidebar,
  onDeleteCustomBlock,
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const scrollingRef = useRef(false)

  // Close dropdown when tapping outside
  useEffect(() => {
    if (!dropdownOpen) return
    const close = () => setDropdownOpen(false)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [dropdownOpen])

  return (
    <div id="world-bottom-bar">
      {/* ── Left: eraser + dropdown ── */}
      <div className="wbb-left" onPointerDown={e => e.stopPropagation()}>
        <div className="wbb-tool-split">
          <button
            className={`wbb-eraser-btn${isEraser ? ' active' : ''}`}
            onClick={onSelectEraser}
            title="Eraser"
          >🧹</button>
          <button
            className="wbb-dropdown-btn"
            onClick={() => setDropdownOpen(o => !o)}
            title="Menu"
          >▾</button>
        </div>
        {dropdownOpen && (
          <div className="wbb-dropdown-menu">
            <button onClick={() => { onSave(); setDropdownOpen(false) }}>💾 SAVE</button>
            <button onClick={() => { onClear(); setDropdownOpen(false) }}>💥 CLEAR</button>
          </div>
        )}
      </div>

      {/* ── Middle: scrollable block picker ── */}
      <div
        className="wbb-blocks"
        onTouchStart={() => { scrollingRef.current = false }}
        onTouchMove={() => { scrollingRef.current = true }}
        onTouchEnd={() => { setTimeout(() => { scrollingRef.current = false }, 100) }}
      >
        {Object.entries(blocks).map(([key, block]) => (
          <BlockBtn
            key={key}
            blockKey={key}
            block={block}
            isSelected={!isEraser && selectedBlock === key}
            onSelect={onSelectBlock}
            onDelete={onDeleteCustomBlock}
            scrollingRef={scrollingRef}
          />
        ))}
      </div>

      {/* ── Right: My Builds ── */}
      <button className="wbb-builds-btn" onClick={onOpenSidebar} title="My Builds">
        🏠
      </button>
    </div>
  )
}
