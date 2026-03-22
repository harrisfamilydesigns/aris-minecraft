import ColorPalette from './ColorPalette'
import BBGrid from './BBGrid'

export default function BlockPanel({
  bbState,
  bbResolution,
  onBBChange,
  onToggleResolution,
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

  return (
    <div id="block-panel">
      <div className="bb-label">Paint your own block! 🖌️ Then hit SAVE BLOCK to add it to the toolbar.</div>
      <ColorPalette
        selectedColor={selectedColor}
        isEraser={isEraser}
        onSelectColor={onSelectColor}
        onSelectEraser={onSelectEraser}
      />
      <BBGrid
        bbState={bbState}
        bbSize={bbResolution}
        onBBChange={onBBChange}
        selectedColor={selectedColor}
        isEraser={isEraser}
      />
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
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
