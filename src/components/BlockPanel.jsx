import ColorPalette from './ColorPalette'
import BBGrid from './BBGrid'

export default function BlockPanel({
  bbState,
  onBBChange,
  selectedColor,
  isEraser,
  onSelectColor,
  onSelectEraser,
  onOpenSaveModal,
}) {
  function handleClear() {
    const empty = Array(8).fill(null).map(() => Array(8).fill(null))
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
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
        <button className="ctrl-btn btn-clear" onClick={handleClear}>🔄 CLEAR</button>
        <button className="ctrl-btn btn-save-block" onClick={() => onOpenSaveModal('block')}>🧱 SAVE BLOCK</button>
      </div>
      <BBGrid
        bbState={bbState}
        onBBChange={onBBChange}
        selectedColor={selectedColor}
        isEraser={isEraser}
      />
    </div>
  )
}
