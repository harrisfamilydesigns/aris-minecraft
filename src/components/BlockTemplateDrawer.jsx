import { useEffect, useRef } from 'react'
import { drawBlock } from '../lib/blocks'

function BlockCard({ blockKey, block, onLoad, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = block.colors.length
    canvas.height = block.colors.length
    drawBlock(canvas, blockKey, { [blockKey]: block })
    canvas.className = 'template-preview'
  }, [blockKey, block])

  return (
    <div className="template-card" onClick={onLoad}>
      <div className="template-name">{block.name}</div>
      <canvas ref={canvasRef} className="template-preview" />
      <div className="template-actions">
        <button className="tpl-btn tpl-load" onClick={e => { e.stopPropagation(); onLoad() }}>▶ LOAD</button>
        <button className="tpl-btn tpl-delete" onClick={e => { e.stopPropagation(); onDelete(blockKey) }}>✕ DEL</button>
      </div>
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
          [...customBlocks].reverse().map(cb => (
            <BlockCard
              key={cb.key}
              blockKey={cb.key}
              block={cb}
              onLoad={() => { onLoad(cb.colors); onClose() }}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}
