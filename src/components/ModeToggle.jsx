export default function ModeToggle({ mode, setMode }) {
  return (
    <div id="mode-toggle-bar">
      <button
        className={`mode-btn${mode === 'world' ? ' active' : ''}`}
        onClick={() => setMode('world')}
      >
        ⛏ WORLD BUILDER
      </button>
      <button
        className={`mode-btn${mode === 'block' ? ' active' : ''}`}
        onClick={() => setMode('block')}
      >
        🎨 BLOCK BUILDER
      </button>
    </div>
  )
}
