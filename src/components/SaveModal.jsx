import { useEffect, useRef, useState } from 'react'

export default function SaveModal({ isOpen, pendingMode, templateCount, customBlockCount, onSave, onCancel }) {
  const inputRef = useRef(null)
  const [name, setName] = useState('')

  useEffect(() => {
    if (isOpen) {
      const defaultName = pendingMode === 'block'
        ? `My Block ${customBlockCount + 1}`
        : `My Build ${templateCount + 1}`
      setName(defaultName)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [isOpen, pendingMode, templateCount, customBlockCount])

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onCancel()
  }

  function handleSave() {
    onSave(name.trim() || 'Untitled')
  }

  return (
    <div id="name-modal" className={isOpen ? 'open' : ''}>
      <div id="name-modal-box">
        <label id="modal-label">
          {pendingMode === 'block' ? 'NAME YOUR BLOCK!' : 'NAME YOUR BUILD!'}
        </label>
        <input
          ref={inputRef}
          id="name-input"
          type="text"
          maxLength={18}
          placeholder="My Build"
          autoComplete="off"
          spellCheck={false}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="modal-btns">
          <button className="modal-btn modal-cancel" onClick={onCancel}>CANCEL</button>
          <button className="modal-btn modal-ok" onClick={handleSave}>SAVE ✔</button>
        </div>
      </div>
    </div>
  )
}
