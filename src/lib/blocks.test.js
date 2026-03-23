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
  it('renders bounding box of placed blocks — old array format', () => {
    const COLS = 18, ROWS = 10
    const state = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    // Place blocks at (0,0) and (2,4) — bounding box is 3 rows × 5 cols
    state[0][0] = 'grass'
    state[2][4] = 'dirt'
    const canvas = buildPreviewCanvas(state, BUILT_IN_BLOCKS)
    expect(canvas.width).toBe(5 * 8)
    expect(canvas.height).toBe(3 * 8)
  })

  it('renders bounding box of placed blocks — new sparse-object format', () => {
    const state = { '0,0': 'grass', '2,4': 'dirt' }
    const canvas = buildPreviewCanvas(state, BUILT_IN_BLOCKS)
    expect(canvas.width).toBe(5 * 8)
    expect(canvas.height).toBe(3 * 8)
  })

  it('returns a tiny canvas for an empty world', () => {
    const canvas = buildPreviewCanvas({}, BUILT_IN_BLOCKS)
    expect(canvas.width).toBe(8)
    expect(canvas.height).toBe(8)
  })
})
