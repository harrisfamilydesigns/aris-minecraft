import { useEffect, useRef } from 'react'
import { drawBlock } from '../lib/blocks'

function BlockButton({ blockKey, block, isSelected, onSelect, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Use the exported drawBlock utility — do not duplicate the pixel loop here
      drawBlock(canvasRef.current, blockKey, { [blockKey]: block })
    }
  }, [blockKey, block])

  return (
    <div
      className={`block-btn${isSelected ? ' selected' : ''}`}
      id={`btn-${blockKey}`}
      onClick={() => onSelect(blockKey)}
      onTouchEnd={e => { e.preventDefault(); onSelect(blockKey) }}
    >
      <canvas ref={canvasRef} />
      <span className="tooltip">{block.name}</span>
      {block.isCustom && (
        <span
          className="custom-del"
          onClick={e => { e.stopPropagation(); onDelete(blockKey) }}
          onTouchEnd={e => { e.stopPropagation(); e.preventDefault(); onDelete(blockKey) }}
        >
          ×
        </span>
      )}
    </div>
  )
}

export default function Toolbar({ blocks, selectedBlock, onSelect, onDelete }) {
  return (
    <div className="toolbar" id="toolbar">
      {Object.entries(blocks).map(([key, block]) => (
        <BlockButton
          key={key}
          blockKey={key}
          block={block}
          isSelected={selectedBlock === key}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
