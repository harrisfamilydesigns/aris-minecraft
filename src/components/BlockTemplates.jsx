import { useEffect, useRef } from 'react'
import { drawBlock } from '../lib/blocks'

function TemplateButton({ blockKey, block, onClick }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) drawBlock(canvasRef.current, blockKey, { [blockKey]: block })
  }, [blockKey, block])

  return (
    <div className="bb-template-btn" onClick={onClick} title={block.name}>
      <canvas ref={canvasRef} />
      <span className="bb-template-name">{block.name}</span>
    </div>
  )
}

export default function BlockTemplates({ customBlocks, onLoad }) {
  if (!customBlocks.length) return null

  return (
    <div className="bb-templates">
      <span className="bb-templates-label">START FROM:</span>
      <div className="bb-templates-scroll">
        {customBlocks.map(cb => (
          <TemplateButton
            key={cb.key}
            blockKey={cb.key}
            block={cb}
            onClick={() => onLoad(cb.colors)}
          />
        ))}
      </div>
    </div>
  )
}
