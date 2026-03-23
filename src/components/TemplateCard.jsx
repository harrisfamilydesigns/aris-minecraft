import { useEffect, useRef } from 'react'
import { buildPreviewCanvas } from '../lib/blocks'

export default function TemplateCard({ template, blocks, onLoad, onDelete }) {
  const previewRef = useRef(null)

  useEffect(() => {
    if (!previewRef.current) return
    const canvas = buildPreviewCanvas(template.state, blocks)
    canvas.className = 'template-preview'
    const container = previewRef.current
    container.innerHTML = ''
    container.appendChild(canvas)
  }, [template.state, blocks])

  return (
    <div className="template-card" onClick={onLoad}>
      <div className="template-name">{template.name}</div>
      <div ref={previewRef} />
      <div className="template-actions">
        <button className="tpl-btn tpl-load" onClick={e => { e.stopPropagation(); onLoad() }}>▶ LOAD</button>
        <button className="tpl-btn tpl-delete" onClick={e => { e.stopPropagation(); onDelete() }}>✕ DEL</button>
      </div>
    </div>
  )
}
