import ColorPalette from './ColorPalette'
import BBGrid from './BBGrid'
import BlockTemplates from './BlockTemplates'

export default function BlockPanel({
  bbState,
  bbResolution,
  onBBChange,
  onToggleResolution,
  onLoadTemplate,
  customBlocks,
  selectedColor,
  isEraser,
  onSelectColor,
  onSelectEraser,
  onOpenSaveModal,
}) {
  function handleClear() {
    const empty = Array(bbResolution).fill(null).map(() => Array(bbResolution).fill(null))
    onBBChange(empty)
  }

  function handleFill() {
    if (isEraser) return
    if (!window.confirm(`Fill entire canvas with this color?`)) return
    const filled = Array(bbResolution).fill(null).map(() => Array(bbResolution).fill(selectedColor))
    onBBChange(filled)
  }

  const usedColors = [...new Set(bbState.flat().filter(Boolean))]

  return (
    <div id="block-panel">
      <div className="bb-label">Paint your own block! 🖌️ Then hit SAVE BLOCK to add it to the toolbar.</div>
      <BlockTemplates customBlocks={customBlocks} onLoad={onLoadTemplate} />
      <ColorPalette
        selectedColor={selectedColor}
        isEraser={isEraser}
        onSelectColor={onSelectColor}
        onSelectEraser={onSelectEraser}
      />
      {usedColors.length > 0 && (
        <div className="used-colors">
          <span className="used-colors-label">USED:</span>
          {usedColors.map(hex => (
            <div
              key={hex}
              className={`color-swatch${!isEraser && selectedColor === hex ? ' selected' : ''}`}
              style={{ background: hex }}
              onClick={() => onSelectColor(hex)}
            >
              <span className="sw-tip">{hex}</span>
            </div>
          ))}
        </div>
      )}
      <BBGrid
        bbState={bbState}
        bbSize={bbResolution}
        onBBChange={onBBChange}
        selectedColor={selectedColor}
        isEraser={isEraser}
      />
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
        <button
          className="ctrl-btn btn-fill"
          onClick={handleFill}
          disabled={isEraser}
        >🪣 FILL</button>
        <button className="ctrl-btn btn-clear" onClick={handleClear}>🔄 CLEAR</button>
        <button
          className={`ctrl-btn btn-resolution${bbResolution === 16 ? ' active' : ''}`}
          onClick={onToggleResolution}
          title="Toggle grid resolution"
        >
          {bbResolution === 8 ? '8×8' : '16×16'}
        </button>
        <button className="ctrl-btn btn-save-block" onClick={() => onOpenSaveModal('block')}>🧱 SAVE BLOCK</button>
      </div>
    </div>
  )
}
