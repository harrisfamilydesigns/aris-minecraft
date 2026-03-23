export default function ModeToggle({ mode, setMode, floating }) {
  return (
    <div id="mode-toggle-bar" className={floating ? 'floating' : ''}>
      <button
        className={`mode-btn${mode === 'world' ? ' active' : ''}`}
        onClick={() => setMode('world')}
      >
        ⛏ WORLD
      </button>
      <button
        className={`mode-btn${mode === 'block' ? ' active' : ''}`}
        onClick={() => setMode('block')}
      >
        🎨 BLOCKS
      </button>
    </div>
  )
}
