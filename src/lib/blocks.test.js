import { describe, it, expect } from 'vitest'
import { BUILT_IN_BLOCKS, drawBlock, buildPreviewCanvas } from './blocks'

describe('BUILT_IN_BLOCKS', () => {
  it('has the 10 expected blocks', () => {
    const keys = Object.keys(BUILT_IN_BLOCKS)
    expect(keys).toContain('grass')
    expect(keys).toContain('diamond')
    expect(keys).toContain('tnt')
    expect(keys).toHaveLength(10)
  })

  it('each block has an 8x8 colors array', () => {
    Object.values(BUILT_IN_BLOCKS).forEach(block => {
      expect(block.colors).toHaveLength(8)
      block.colors.forEach(row => expect(row).toHaveLength(8))
    })
  })
})

describe('drawBlock', () => {
  it('draws pixels onto a canvas', () => {
    const canvas = document.createElement('canvas')
    drawBlock(canvas, 'grass', BUILT_IN_BLOCKS)
    expect(canvas.width).toBe(8)
    expect(canvas.height).toBe(8)
  })
})

describe('buildPreviewCanvas', () => {
  it('returns a canvas of COLS*8 x ROWS*8 pixels', () => {
    const COLS = 18, ROWS = 10
    const state = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    state[0][0] = 'grass'
    const canvas = buildPreviewCanvas(state, BUILT_IN_BLOCKS, COLS, ROWS)
    expect(canvas.width).toBe(COLS * 8)
    expect(canvas.height).toBe(ROWS * 8)
  })
})
