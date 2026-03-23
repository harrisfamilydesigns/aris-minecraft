import { useEffect, useRef, useState } from 'react'
import { PALETTE } from '../lib/palette'

export default function BlockBottomBar({
  selectedColor,
  isEraser,
  bbResolution,
  onSelectColor,
  onSelectEraser,
  onFill,
  onClear,
  onSave,
  onToggleResolution,
  onOpenTemplates,
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

  const isCustomColor = !isEraser && !PALETTE.find(p => p.hex === selectedColor)

  return (
    <div id="block-bottom-bar">
      {/* ── Fill ── */}
      <button
        className="wbb-fill-btn"
        onClick={onFill}
        disabled={isEraser}
        title="Fill canvas with selected color"
      >🪣</button>

      {/* ── Eraser + dropdown ── */}
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

      {/* ── Scrollable color strip ── */}
      <div
        className="wbb-blocks"
        onTouchStart={() => { scrollingRef.current = false }}
        onTouchMove={() => { scrollingRef.current = true }}
        onTouchEnd={() => { setTimeout(() => { scrollingRef.current = false }, 100) }}
      >
        {PALETTE.map(({ hex, name }) => (
          <div
            key={hex}
            className={`color-swatch bb-bar-swatch${!isEraser && selectedColor === hex ? ' selected' : ''}`}
            style={{ background: hex }}
            title={name}
            onClick={() => onSelectColor(hex)}
            onTouchEnd={e => {
              if (scrollingRef.current) return
              e.preventDefault()
              onSelectColor(hex)
            }}
          />
        ))}
      </div>

      {/* ── Custom color picker ── */}
      <div
        className={`wbb-custom-color-btn${isCustomColor ? ' selected' : ''}`}
        style={isCustomColor ? { background: selectedColor } : {}}
        title="Custom color"
      >
        🎨
        <input
          type="color"
          defaultValue="#ff0000"
          onChange={e => onSelectColor(e.target.value)}
        />
      </div>

      {/* ── Resolution toggle ── */}
      <button
        className={`wbb-res-btn${bbResolution === 16 ? ' active' : ''}`}
        onClick={onToggleResolution}
        title="Toggle grid resolution"
      >{bbResolution}</button>

      {/* ── Template drawer ── */}
      <button className="wbb-builds-btn" onClick={onOpenTemplates} title="Start from…">
        🧩
      </button>
    </div>
  )
}
