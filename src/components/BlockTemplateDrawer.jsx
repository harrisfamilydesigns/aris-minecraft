import { useEffect, useRef } from 'react'
import { drawBlock } from '../lib/blocks'

function TemplateButton({ blockKey, block, onClick, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) drawBlock(canvasRef.current, blockKey, { [blockKey]: block })
  }, [blockKey, block])

  return (
    <div className="bb-template-btn" onClick={onClick} title={block.name}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <canvas ref={canvasRef} />
        <span
          className="custom-del"
          style={{ display: 'block' }}
          onClick={e => { e.stopPropagation(); onDelete(blockKey) }}
        >×</span>
      </div>
      <span className="bb-template-name">{block.name}</span>
    </div>
  )
}

export default function BlockTemplateDrawer({ customBlocks, isOpen, onClose, onLoad, onDelete }) {
  return (
    <div id="block-drawer" className={isOpen ? 'open' : ''}>
      <div id="sidebar-title">
        <span>🧩 START FROM</span>
        <button id="sidebar-close" onClick={onClose}>✕</button>
      </div>
      <div id="template-list">
        {customBlocks.length === 0 ? (
          <div id="sidebar-empty">
            No custom blocks yet!<br /><br />
            Save a block to use it as a starting point.
          </div>
        ) : (
          customBlocks.map(cb => (
            <TemplateButton
              key={cb.key}
              blockKey={cb.key}
              block={cb}
              onClick={() => { onLoad(cb.colors); onClose() }}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
