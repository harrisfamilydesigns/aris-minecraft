import TemplateCard from './TemplateCard'

export default function Sidebar({ templates, blocks, onLoadTemplate, onDeleteTemplate, isOpen, onClose }) {
  return (
    <div id="sidebar" className={isOpen ? 'open' : ''}>
      <div id="sidebar-title">
        <span>📦 MY BUILDS</span>
        <button id="sidebar-close" onClick={onClose}>✕</button>
      </div>
      <div id="template-list">
        {templates.length === 0 ? (
          <div id="sidebar-empty">
            No saves yet!<br /><br />
            Build something cool then hit 💾 SAVE!
          </div>
        ) : (
          templates.map((tpl, idx) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              blocks={blocks}
              onLoad={() => onLoadTemplate(idx)}
              onDelete={() => onDeleteTemplate(tpl.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
