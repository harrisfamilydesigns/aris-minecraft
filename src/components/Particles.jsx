import { forwardRef, useImperativeHandle, useRef } from 'react'

const Particles = forwardRef(function Particles(_, ref) {
  const containerRef = useRef(null)

  useImperativeHandle(ref, () => ({
    spawn(cellEl, colors) {
      if (!containerRef.current || !cellEl) return
      const rect = cellEl.getBoundingClientRect()
      const cols = colors || ['#fff']
      for (let i = 0; i < 4; i++) {
        const p = document.createElement('div')
        p.className = 'particle'
        p.style.background = cols[Math.floor(Math.random() * cols.length)]
        p.style.left = (rect.left + Math.random() * 36) + 'px'
        p.style.top = (rect.top + Math.random() * 36) + 'px'
        containerRef.current.appendChild(p)
        setTimeout(() => p.remove(), 1000)
      }
    },
    spawnAt(x, y, colors) {
      if (!containerRef.current) return
      const cols = colors || ['#fff']
      for (let i = 0; i < 4; i++) {
        const p = document.createElement('div')
        p.className = 'particle'
        p.style.background = cols[Math.floor(Math.random() * cols.length)]
        p.style.left = (x + (Math.random() - 0.5) * 36) + 'px'
        p.style.top = (y + (Math.random() - 0.5) * 36) + 'px'
        containerRef.current.appendChild(p)
        setTimeout(() => p.remove(), 1000)
      }
    },
    spawnExplosion() {
      if (!containerRef.current) return
      const expColors = ['#ff6a00', '#ffaa00', '#cc0000', '#ff0000', '#ffff00']
      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          const p = document.createElement('div')
          p.className = 'particle'
          p.style.background = expColors[Math.floor(Math.random() * 5)]
          p.style.left = (window.innerWidth / 2 + (Math.random() - 0.5) * 300) + 'px'
          p.style.top = (window.innerHeight / 2 + (Math.random() - 0.5) * 200) + 'px'
          p.style.width = p.style.height = '12px'
          containerRef.current?.appendChild(p)
          setTimeout(() => p.remove(), 1000)
        }, i * 30)
      }
    },
  }))

  return <div className="particles" ref={containerRef} id="particles" />
})

export default Particles
