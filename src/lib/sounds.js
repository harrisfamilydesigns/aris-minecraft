export function playPlaceSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.type = 'square'
    osc.frequency.setValueAtTime(600 + Math.random() * 400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1)
  } catch (e) {}
}

export function playExplosion() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.9, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.8)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.6)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(1.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9)
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination)
    src.start()
    src.onended = () => ctx.close()
  } catch (e) {}
}

export function playFanfare() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.type = 'square'
      const t = ctx.currentTime + i * 0.12
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0.07, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
      osc.start(t); osc.stop(t + 0.15)
    })
  } catch (e) {}
}
