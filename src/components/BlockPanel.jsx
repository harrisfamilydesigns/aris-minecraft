import BBGrid from './BBGrid'

export default function BlockPanel({
  bbState,
  bbResolution,
  onBBChange,
  selectedColor,
  isEraser,
  onSelectColor,
}) {
  const usedColors = [...new Set(bbState.flat().filter(Boolean))]

  return (
    <div id="block-panel">
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
    </div>
  )
}
