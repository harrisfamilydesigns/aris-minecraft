import { useRef } from 'react'
import { PALETTE } from '../lib/palette'

export default function ColorPalette({ selectedColor, isEraser, onSelectColor, onSelectEraser }) {
  const colorInputRef = useRef(null)

  return (
    <div className="color-palette" id="color-palette">
      {PALETTE.map(({ hex, name }) => (
        <div
          key={hex}
          className={`color-swatch${!isEraser && selectedColor === hex ? ' selected' : ''}`}
          style={{ background: hex }}
          data-color={hex}
          onClick={() => onSelectColor(hex)}
        >
          <span className="sw-tip">{name}</span>
        </div>
      ))}

      {/* Custom colour picker */}
      <div
        id="swatch-custom"
        className={`color-swatch${!isEraser && !PALETTE.find(p => p.hex === selectedColor) ? ' selected' : ''}`}
        style={!isEraser && !PALETTE.find(p => p.hex === selectedColor) ? { background: selectedColor } : {}}
        onClick={() => colorInputRef.current?.click()}
      >
        <span className="sw-tip">Custom Color</span>
        🎨
      </div>

      {/* Eraser swatch */}
      <div
        id="swatch-eraser"
        className={`color-swatch${isEraser ? ' selected' : ''}`}
        onClick={onSelectEraser}
      >
        <span className="sw-tip">Eraser (Gray)</span>
        🧹
      </div>

      <input
        ref={colorInputRef}
        type="color"
        id="custom-color-input"
        defaultValue="#ff0000"
        onChange={e => onSelectColor(e.target.value)}
      />
    </div>
  )
}
