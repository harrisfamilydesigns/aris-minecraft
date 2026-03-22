import { useEffect } from 'react'

export default function CreeperPopup({ message, onDone, style = {} }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="creeper-popup"
      style={{
        fontFamily: "'Press Start 2P', monospace",
        textAlign: 'center',
        ...style,
      }}
    >
      {message}
    </div>
  )
}
