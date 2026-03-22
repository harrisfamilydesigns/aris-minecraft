import TemplateCard from './TemplateCard'

export default function Sidebar({ templates, blocks, onLoadTemplate, onDeleteTemplate }) {
  return (
    <div id="sidebar">
      <div id="sidebar-title">📦 MY BUILDS</div>
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
