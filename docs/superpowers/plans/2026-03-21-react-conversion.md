# React Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the monolithic `index.html` Minecraft world builder into a Vite + React app with React Query, preserving every feature and visual detail.

**Architecture:** All UI is split into focused React components under `src/components/`. Pure logic (block definitions, canvas rendering, sounds, colour palette) lives in `src/lib/`. React Query manages all Supabase data fetching (templates and custom blocks), with mutations for save/delete. Global state (grid, mode, selected block, block-builder) is held in `App.jsx` and passed down via props.

**Tech Stack:** Vite 5, React 18, @tanstack/react-query v5, @supabase/supabase-js v2, vitest + @testing-library/react for utilities

---

## File Map

| File | Responsibility |
|------|---------------|
| `index.html` | Vite entry shell (minimal) |
| `CNAME` | Keep as-is |
| `src/main.jsx` | Mount app, wrap with QueryClientProvider |
| `src/App.jsx` | Root component — holds mode, selectedBlock, isEraser, gridState, blockCount, bbState, bbColor, bbEraser, saveModal state; wires all children |
| `src/lib/blocks.js` | BUILT_IN_BLOCKS definitions, `drawBlock()`, `buildPreviewCanvas()` |
| `src/lib/palette.js` | PALETTE colour array |
| `src/lib/sounds.js` | `playPlaceSound()`, `playExplosion()`, `playFanfare()` |
| `src/lib/supabase.js` | Supabase client singleton |
| `src/hooks/useTemplates.js` | React Query hooks: `useTemplates`, `useSaveTemplate`, `useDeleteTemplate` |
| `src/hooks/useCustomBlocks.js` | React Query hooks: `useCustomBlocks`, `useSaveCustomBlock`, `useDeleteCustomBlock` |
| `src/components/Clouds.jsx` | Three animated CSS clouds |
| `src/components/Ground.jsx` | Fixed green ground bar |
| `src/components/Header.jsx` | Pixel-font title |
| `src/components/ModeToggle.jsx` | World / Block Builder toggle buttons |
| `src/components/Score.jsx` | "Blocks placed: N" display |
| `src/components/Toolbar.jsx` | Block picker buttons (built-in + custom, with delete badge) |
| `src/components/WorldGrid.jsx` | 18×10 cell grid with mouse/touch drag painting |
| `src/components/WorldPanel.jsx` | Composes Score, Toolbar, world action buttons, WorldGrid |
| `src/components/ColorPalette.jsx` | Colour swatches + custom colour picker + eraser swatch |
| `src/components/BBGrid.jsx` | 8×8 block-builder canvas grid |
| `src/components/BlockPanel.jsx` | Composes label, ColorPalette, BB action buttons, BBGrid |
| `src/components/Sidebar.jsx` | "MY BUILDS" sidebar + template list |
| `src/components/TemplateCard.jsx` | Single saved-build card with preview canvas, LOAD and DEL |
| `src/components/SaveModal.jsx` | Name-input modal (world build or custom block) |
| `src/components/Particles.jsx` | Fixed overlay; exposes imperative `spawnParticles(x,y,colors)` via ref |
| `src/components/CreeperPopup.jsx` | Animated popup message (receives `message` prop, auto-dismisses) |
| `src/styles/index.css` | All CSS from original, split into logical sections |
| `.github/workflows/deploy.yml` | Build on push to main → deploy to GitHub Pages |

---

## Task 1: Init Vite + React project

**Files:**
- Create: `src/main.jsx`
- Create: `src/App.jsx` (stub)
- Create: `src/styles/index.css` (empty for now)
- Modify: `index.html` (Vite entry shell)
- Create: `package.json`, `vite.config.js`

- [ ] **Step 1: Scaffold Vite project in the worktree root**

```bash
# Run from worktree root
npm create vite@latest . -- --template react
# When prompted "Current directory is not empty" → choose to ignore/overwrite
# Select "React" framework, "JavaScript" variant
```

> Note: This will generate `package.json`, `vite.config.js`, `src/main.jsx`, `src/App.jsx`, etc. Keep the `CNAME` file.

- [ ] **Step 2: Install all dependencies**

```bash
npm install
npm install @tanstack/react-query @supabase/supabase-js
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Configure vitest in `vite.config.js`**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.js'],
  },
})
```

Note: CNAME is handled via `public/CNAME` (see Task 15) — no custom plugin needed.

- [ ] **Step 4: Create `src/test-setup.js`**

```js
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Add test script to `package.json`**

Ensure `package.json` scripts include:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Stub `src/App.jsx`**

```jsx
export default function App() {
  return <div>Loading...</div>
}
```

- [ ] **Step 7: Stub `src/main.jsx`**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 8: Update `index.html` to Vite shell (preserve title)**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ari's Minecraft World</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at localhost:5173, no errors

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React project with dependencies"
```

---

## Task 2: CSS — global styles

**Files:**
- Create: `src/styles/index.css`

- [ ] **Step 1: Copy all CSS from original `index.html` into `src/styles/index.css`**

Copy everything between `<style>` and `</style>` in the original `index.html`. The full content (lines 8–284 of the original) goes into `src/styles/index.css`, with two modifications:

1. **Remove the `@import` for Google Fonts** — the font is already loaded via `<link>` in `index.html` (Task 1 Step 8). Delete the line: `@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');`

2. **Remove the display-toggle rules for `#world-panel` and `#block-panel`** — React conditional rendering replaces this responsibility. Delete/replace these two rules:
   - `#world-panel { display:flex; flex-direction:column; flex:1; }` → keep the flex styles, just remove any `display:none` toggle
   - `#block-panel { display:none; flex-direction:column; align-items:center; flex:1; overflow:hidden; }` → remove `display:none`
   - `#block-panel.visible { display:flex; }` → remove entirely

   Instead both panels should have `display:flex` always (React mounts/unmounts them to show/hide).

Key sections to preserve exactly:
- Reset (`* { margin:0; padding:0; box-sizing:border-box; }`)
- body, `#main-content`
- `.cloud`, `@keyframes floatCloud`
- `.header`, `@keyframes titleBounce`
- `#mode-toggle-bar`, `.mode-btn`
- `.score`
- `#world-panel`, `.toolbar`, `.block-btn`, `.block-btn .tooltip`, `.block-btn .custom-del`
- `.grid-container`, `.grid`, `.cell`
- `#block-panel`, `.bb-label`, `.color-palette`, `.color-swatch`, `#swatch-custom`, `#swatch-eraser`, `#custom-color-input`
- `.bb-grid-container`, `.bb-grid`, `.bb-cell`
- `.controls`, `.ctrl-btn`, button colour variants
- `.particles`, `.particle`, `@keyframes particleFall`
- `.creeper-popup`, `@keyframes creeperPop`
- `.ground`
- `#sidebar`, `#sidebar-title`, `#sidebar-empty`, `#template-list`, `.template-card`, `.template-name`, `.template-preview`, `.template-actions`, `.tpl-btn`
- `#name-modal`, `#name-modal-box`, `#name-input`, `.modal-btns`, `.modal-btn`

- [ ] **Step 2: Verify `npm run dev` still starts without style errors**

- [ ] **Step 3: Commit**

```bash
git add src/styles/index.css
git commit -m "feat: port all CSS from original index.html"
```

---

## Task 3: Pure utilities — blocks, palette, sounds

**Files:**
- Create: `src/lib/blocks.js`
- Create: `src/lib/palette.js`
- Create: `src/lib/sounds.js`
- Create: `src/lib/blocks.test.js`

- [ ] **Step 1: Write failing tests for `drawBlock` and `buildPreviewCanvas`**

```js
// src/lib/blocks.test.js
import { describe, it, expect, beforeEach } from 'vitest'
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
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npm test
```

Expected: FAIL — `Cannot find module './blocks'`

- [ ] **Step 3: Create `src/lib/blocks.js`**

```js
// 10 built-in block definitions. Each has name + 8×8 colors array.
export const BUILT_IN_BLOCKS = {
  grass: { name: 'Grass', colors: [
    ['#5a8f29','#4a7a22','#6ba332','#5a8f29','#4a7a22','#6ba332','#5a8f29','#4a7a22'],
    ['#6ba332','#5a8f29','#4a7a22','#6ba332','#5a8f29','#6ba332','#4a7a22','#5a8f29'],
    ['#8B6914','#7a5c12','#8B6914','#9a7520','#8B6914','#7a5c12','#9a7520','#8B6914'],
    ['#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914'],
    ['#8B6914','#9a7520','#7a5c12','#8B6914','#7a5c12','#8B6914','#9a7520','#7a5c12'],
    ['#9a7520','#7a5c12','#8B6914','#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520'],
    ['#7a5c12','#8B6914','#7a5c12','#8B6914','#9a7520','#8B6914','#7a5c12','#8B6914'],
    ['#8B6914','#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520','#8B6914','#7a5c12'],
  ]},
  dirt: { name: 'Dirt', colors: [
    ['#8B6914','#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914','#9a7520','#7a5c12'],
    ['#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914','#9a7520'],
    ['#7a5c12','#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914'],
    ['#8B6914','#7a5c12','#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520','#7a5c12'],
    ['#9a7520','#8B6914','#7a5c12','#9a7520','#8B6914','#7a5c12','#8B6914','#9a7520'],
    ['#7a5c12','#8B6914','#9a7520','#7a5c12','#9a7520','#8B6914','#7a5c12','#8B6914'],
    ['#8B6914','#9a7520','#7a5c12','#8B6914','#7a5c12','#9a7520','#8B6914','#7a5c12'],
    ['#7a5c12','#8B6914','#9a7520','#7a5c12','#8B6914','#7a5c12','#9a7520','#8B6914'],
  ]},
  stone: { name: 'Stone', colors: [
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393'],
    ['#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a'],
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#6e6e6e','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393'],
    ['#939393','#8a8a8a','#6e6e6e','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a'],
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#6e6e6e','#939393'],
  ]},
  wood: { name: 'Wood', colors: [
    ['#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230'],
    ['#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423'],
    ['#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230'],
    ['#7a5230','#6b4423','#5c3818','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423'],
    ['#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#5c3818','#6b4423','#7a5230'],
    ['#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423'],
    ['#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230','#6b4423','#7a5230'],
    ['#7a5230','#6b4423','#7a5230','#5c3818','#7a5230','#6b4423','#7a5230','#6b4423'],
  ]},
  leaves: { name: 'Leaves', colors: [
    ['#2d7a2d','#3a8f3a','#2d7a2d','#1f6b1f','#3a8f3a','#2d7a2d','#3a8f3a','#2d7a2d'],
    ['#3a8f3a','#2d7a2d','#1f6b1f','#3a8f3a','#2d7a2d','#1f6b1f','#2d7a2d','#3a8f3a'],
    ['#1f6b1f','#3a8f3a','#2d7a2d','#3a8f3a','#1f6b1f','#3a8f3a','#2d7a2d','#1f6b1f'],
    ['#3a8f3a','#2d7a2d','#3a8f3a','#1f6b1f','#3a8f3a','#2d7a2d','#1f6b1f','#3a8f3a'],
    ['#2d7a2d','#1f6b1f','#2d7a2d','#3a8f3a','#2d7a2d','#3a8f3a','#2d7a2d','#1f6b1f'],
    ['#1f6b1f','#3a8f3a','#1f6b1f','#2d7a2d','#3a8f3a','#1f6b1f','#3a8f3a','#2d7a2d'],
    ['#3a8f3a','#2d7a2d','#3a8f3a','#1f6b1f','#2d7a2d','#3a8f3a','#2d7a2d','#3a8f3a'],
    ['#2d7a2d','#1f6b1f','#2d7a2d','#3a8f3a','#1f6b1f','#2d7a2d','#1f6b1f','#2d7a2d'],
  ]},
  diamond: { name: 'Diamond', colors: [
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#939393','#4aedd9','#4aedd9','#939393','#8a8a8a','#7d7d7d','#939393'],
    ['#939393','#4aedd9','#6ef7eb','#4aedd9','#4aedd9','#7d7d7d','#939393','#8a8a8a'],
    ['#8a8a8a','#4aedd9','#4aedd9','#6ef7eb','#4aedd9','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#939393','#4aedd9','#4aedd9','#939393','#4aedd9','#4aedd9','#939393'],
    ['#939393','#8a8a8a','#7d7d7d','#939393','#4aedd9','#6ef7eb','#4aedd9','#8a8a8a'],
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#4aedd9','#4aedd9','#7d7d7d','#939393'],
    ['#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#939393','#8a8a8a'],
  ]},
  lava: { name: 'Lava', colors: [
    ['#cf4a00','#e05500','#ff6a00','#cf4a00','#e05500','#ff6a00','#cf4a00','#e05500'],
    ['#ff6a00','#ff8c00','#ffaa00','#ff6a00','#cf4a00','#e05500','#ff6a00','#cf4a00'],
    ['#e05500','#ff6a00','#cf4a00','#ffaa00','#ff8c00','#ff6a00','#cf4a00','#ff6a00'],
    ['#ffaa00','#cf4a00','#ff6a00','#ff8c00','#cf4a00','#ffaa00','#ff6a00','#e05500'],
    ['#cf4a00','#ff8c00','#ffaa00','#ff6a00','#ff8c00','#cf4a00','#ffaa00','#ff6a00'],
    ['#ff6a00','#cf4a00','#ff6a00','#cf4a00','#ffaa00','#ff6a00','#cf4a00','#ff8c00'],
    ['#e05500','#ff6a00','#cf4a00','#ff8c00','#cf4a00','#ff8c00','#ff6a00','#cf4a00'],
    ['#cf4a00','#e05500','#ff6a00','#cf4a00','#ff6a00','#cf4a00','#e05500','#ff6a00'],
  ]},
  water: { name: 'Water', colors: [
    ['#1a5276','#2471a3','#1a5276','#2980b9','#2471a3','#1a5276','#2471a3','#2980b9'],
    ['#2471a3','#2980b9','#2471a3','#1a5276','#2980b9','#2471a3','#2980b9','#1a5276'],
    ['#2980b9','#1a5276','#2980b9','#2471a3','#1a5276','#2980b9','#1a5276','#2471a3'],
    ['#1a5276','#2471a3','#1a5276','#2980b9','#2471a3','#1a5276','#2471a3','#2980b9'],
    ['#2471a3','#2980b9','#2471a3','#1a5276','#2980b9','#2471a3','#2980b9','#1a5276'],
    ['#2980b9','#1a5276','#2980b9','#2471a3','#1a5276','#2980b9','#1a5276','#2471a3'],
    ['#1a5276','#2471a3','#1a5276','#2980b9','#2471a3','#1a5276','#2980b9','#2471a3'],
    ['#2471a3','#2980b9','#2471a3','#1a5276','#2980b9','#2471a3','#1a5276','#2980b9'],
  ]},
  tnt: { name: 'TNT', colors: [
    ['#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000'],
    ['#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000'],
    ['#cc0000','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#cc0000'],
    ['#aa0000','#ffffff','#333333','#333333','#333333','#333333','#ffffff','#aa0000'],
    ['#cc0000','#ffffff','#333333','#333333','#333333','#333333','#ffffff','#cc0000'],
    ['#aa0000','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#ffffff','#aa0000'],
    ['#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000'],
    ['#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000','#aa0000','#cc0000'],
  ]},
  gold: { name: 'Gold', colors: [
    ['#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#7d7d7d'],
    ['#7d7d7d','#ffd700','#ffed4a','#939393','#8a8a8a','#7d7d7d','#939393','#939393'],
    ['#939393','#ffed4a','#ffd700','#ffd700','#7d7d7d','#939393','#8a8a8a','#8a8a8a'],
    ['#8a8a8a','#7d7d7d','#ffd700','#ffed4a','#939393','#ffd700','#ffd700','#7d7d7d'],
    ['#7d7d7d','#939393','#8a8a8a','#7d7d7d','#ffd700','#ffed4a','#ffd700','#939393'],
    ['#939393','#8a8a8a','#ffd700','#ffd700','#939393','#ffd700','#7d7d7d','#8a8a8a'],
    ['#8a8a8a','#ffd700','#ffed4a','#ffd700','#8a8a8a','#7d7d7d','#939393','#7d7d7d'],
    ['#7d7d7d','#939393','#ffd700','#8a8a8a','#7d7d7d','#939393','#8a8a8a','#939393'],
  ]},
}

/**
 * Paint a block's 8×8 texture onto a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {string} blockType
 * @param {object} blocks - the combined blocks map (BUILT_IN_BLOCKS + custom)
 */
export function drawBlock(canvas, blockType, blocks) {
  const ctx = canvas.getContext('2d')
  const block = blocks[blockType]
  canvas.width = canvas.height = 8
  ctx.clearRect(0, 0, 8, 8)
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const color = block.colors[y][x]
      if (color == null) continue
      ctx.fillStyle = color
      ctx.fillRect(x, y, 1, 1)
    }
}

/**
 * Build a miniature preview canvas of the full world grid state.
 * @param {Array<Array<string|null>>} state - ROWS×COLS grid of block keys
 * @param {object} blocks - combined blocks map
 * @param {number} cols
 * @param {number} rows
 * @returns {HTMLCanvasElement}
 */
export function buildPreviewCanvas(state, blocks, cols, rows) {
  const canvas = document.createElement('canvas')
  canvas.width = cols * 8
  canvas.height = rows * 8
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const bt = state[r][c]
      if (!bt || !blocks[bt]) continue
      const colors = blocks[bt].colors
      for (let py = 0; py < 8; py++)
        for (let px = 0; px < 8; px++) {
          if (colors[py][px] == null) continue
          ctx.fillStyle = colors[py][px]
          ctx.fillRect(c * 8 + px, r * 8 + py, 1, 1)
        }
    }
  return canvas
}
```

- [ ] **Step 4: Create `src/lib/palette.js`**

```js
export const PALETTE = [
  { hex: '#F9FFFE', name: 'White' },
  { hex: '#9D9D97', name: 'Light Gray' },
  { hex: '#474F52', name: 'Gray' },
  { hex: '#1D1D21', name: 'Black' },
  { hex: '#835432', name: 'Brown' },
  { hex: '#8B6914', name: 'Dirt' },
  { hex: '#6B4423', name: 'Wood' },
  { hex: '#5c3818', name: 'Dark Wood' },
  { hex: '#5a8f29', name: 'Grass' },
  { hex: '#80C71F', name: 'Lime' },
  { hex: '#2d7a2d', name: 'Leaves' },
  { hex: '#169C9C', name: 'Cyan' },
  { hex: '#2471A3', name: 'Water' },
  { hex: '#87CEEB', name: 'Sky' },
  { hex: '#4AEDD9', name: 'Diamond' },
  { hex: '#3AB3DA', name: 'Light Blue' },
  { hex: '#B02E26', name: 'Red' },
  { hex: '#F9801D', name: 'Orange' },
  { hex: '#FF6A00', name: 'Lava' },
  { hex: '#FED83D', name: 'Yellow' },
  { hex: '#FFD700', name: 'Gold' },
  { hex: '#F38BAA', name: 'Pink' },
  { hex: '#8932B8', name: 'Purple' },
  { hex: '#C74EBD', name: 'Magenta' },
]
```

- [ ] **Step 5: Create `src/lib/sounds.js`**

```js
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
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npm test
```

Expected: All 4 tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/ src/test-setup.js
git commit -m "feat: add block definitions, canvas utilities, palette, sounds with tests"
```

---

## Task 4: Supabase client + React Query setup

**Files:**
- Create: `src/lib/supabase.js`
- Modify: `src/main.jsx`

- [ ] **Step 1: Create `src/lib/supabase.js`**

```js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xeziherrnomjgjzdxltk.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlemloZXJybm9tamdqemR4bHRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3ODI0OTcsImV4cCI6MjA4OTM1ODQ5N30.lDOA2OYmZgQxcgUnjxtCqwlD60Il7Zg4OdcBt3PTSkw'

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY)
```

- [ ] **Step 2: Update `src/main.jsx` to wrap with QueryClientProvider**

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>
)
```

- [ ] **Step 3: Verify `npm run dev` still works**

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabase.js src/main.jsx
git commit -m "feat: add Supabase client and React Query provider"
```

---

## Task 5: React Query hooks

**Files:**
- Create: `src/hooks/useTemplates.js`
- Create: `src/hooks/useCustomBlocks.js`

- [ ] **Step 1: Create `src/hooks/useTemplates.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sb } from '../lib/supabase'

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('minecraft_builds')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data.map(r => ({ id: r.id, name: r.name, state: r.state }))
    },
  })
}

export function useSaveTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, state }) => {
      const { data, error } = await sb
        .from('minecraft_builds')
        .insert({ name, state })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await sb.from('minecraft_builds').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })
}
```

- [ ] **Step 2: Create `src/hooks/useCustomBlocks.js`**

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sb } from '../lib/supabase'

export function useCustomBlocks() {
  return useQuery({
    queryKey: ['custom-blocks'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('minecraft_custom_blocks')
        .select('*')
        .order('created_at')
      if (error) throw error
      return data.map(r => ({ id: r.id, key: r.key, name: r.name, colors: r.colors }))
    },
  })
}

export function useSaveCustomBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, name, colors }) => {
      const { data, error } = await sb
        .from('minecraft_custom_blocks')
        .insert({ key, name, colors })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-blocks'] }),
  })
}

export function useDeleteCustomBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (key) => {
      const { error } = await sb
        .from('minecraft_custom_blocks')
        .delete()
        .eq('key', key)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['custom-blocks'] }),
  })
}
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/
git commit -m "feat: add React Query hooks for templates and custom blocks"
```

---

## Task 6: Static layout components

**Files:**
- Create: `src/components/Clouds.jsx`
- Create: `src/components/Ground.jsx`
- Create: `src/components/Header.jsx`
- Create: `src/components/ModeToggle.jsx`
- Create: `src/components/Score.jsx`

- [ ] **Step 1: Create `src/components/Clouds.jsx`**

```jsx
export default function Clouds() {
  return (
    <>
      <div className="cloud" style={{ width: '120px', height: '40px', top: '30px', animationDuration: '25s', animationDelay: '-5s' }} />
      <div className="cloud" style={{ width: '90px', height: '30px', top: '60px', animationDuration: '35s', animationDelay: '-15s' }} />
      <div className="cloud" style={{ width: '140px', height: '45px', top: '15px', animationDuration: '30s', animationDelay: '-22s' }} />
    </>
  )
}
```

- [ ] **Step 2: Create `src/components/Ground.jsx`**

```jsx
export default function Ground() {
  return <div className="ground" />
}
```

- [ ] **Step 3: Create `src/components/Header.jsx`**

```jsx
export default function Header() {
  return (
    <div className="header">
      <h1>⛏ ARI'S MINECRAFT WORLD ⛏</h1>
    </div>
  )
}
```

- [ ] **Step 4: Create `src/components/ModeToggle.jsx`**

```jsx
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
```

- [ ] **Step 5: Create `src/components/Score.jsx`**

```jsx
export default function Score({ count }) {
  return <div className="score">Blocks placed: {count}</div>
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/
git commit -m "feat: add Clouds, Ground, Header, ModeToggle, Score components"
```

---

## Task 7: Toolbar component

**Files:**
- Create: `src/components/Toolbar.jsx`

The toolbar renders all blocks (built-in + custom) as canvas buttons. Custom blocks get a delete badge.

- [ ] **Step 1: Create `src/components/Toolbar.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { drawBlock } from '../lib/blocks'

function BlockButton({ blockKey, block, isSelected, onSelect, onDelete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Use the exported drawBlock utility — do not duplicate the pixel loop here
      drawBlock(canvasRef.current, blockKey, { [blockKey]: block })
    }
  }, [blockKey, block])

  return (
    <div
      className={`block-btn${isSelected ? ' selected' : ''}`}
      id={`btn-${blockKey}`}
      onClick={() => onSelect(blockKey)}
    >
      <canvas ref={canvasRef} />
      <span className="tooltip">{block.name}</span>
      {block.isCustom && (
        <span
          className="custom-del"
          onClick={e => { e.stopPropagation(); onDelete(blockKey) }}
        >
          ×
        </span>
      )}
    </div>
  )
}

export default function Toolbar({ blocks, selectedBlock, onSelect, onDelete }) {
  return (
    <div className="toolbar" id="toolbar">
      {Object.entries(blocks).map(([key, block]) => (
        <BlockButton
          key={key}
          blockKey={key}
          block={block}
          isSelected={selectedBlock === key}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Toolbar.jsx
git commit -m "feat: add Toolbar component with canvas block rendering"
```

---

## Task 8: WorldGrid component

**Files:**
- Create: `src/components/WorldGrid.jsx`

This is the 18×10 grid. Must support mouse-drag painting (mousedown + mouseenter) and touch events.

- [ ] **Step 1: Create `src/components/WorldGrid.jsx`**

```jsx
import React, { useEffect, useRef, useCallback } from 'react'
import { drawBlock } from '../lib/blocks'
import { playPlaceSound } from '../lib/sounds'

const COLS = 18
const ROWS = 10

function cellBg(r) {
  return `rgba(135,206,235,${0.3 - r * 0.02})`
}

export default function WorldGrid({
  gridState,
  onGridChange,
  blocks,
  selectedBlock,
  isEraser,
  onBlockCountChange,
  onSpawnParticles,
}) {
  const isMouseDown = useRef(false)

  const paint = useCallback((r, c, cellEl) => {
    if (isEraser) {
      if (gridState[r][c]) {
        const next = gridState.map(row => [...row])
        next[r][c] = null
        onGridChange(next)
        onBlockCountChange(count => Math.max(0, count - 1))
      }
      return  // no particles when erasing
    }
    if (!selectedBlock) return
    if (gridState[r][c] === selectedBlock) return
    const next = gridState.map(row => [...row])
    const isNew = !next[r][c]
    next[r][c] = selectedBlock
    onGridChange(next)
    if (isNew) onBlockCountChange(count => count + 1)
    playPlaceSound()
    // Only spawn particles when actually placing a block (not erasing)
    if (cellEl) onSpawnParticles(cellEl)
  }, [gridState, onGridChange, selectedBlock, isEraser, onBlockCountChange, onSpawnParticles])

  useEffect(() => {
    const up = () => { isMouseDown.current = false }
    document.addEventListener('mouseup', up)
    return () => document.removeEventListener('mouseup', up)
  }, [])

  const cells = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const blockType = gridState[r][c]
      cells.push(
        <Cell
          key={`${r}-${c}`}
          r={r} c={c}
          blockType={blockType}
          blocks={blocks}
          isMouseDown={isMouseDown}
          onPaint={paint}
        />
      )
    }
  }

  return (
    <div className="grid-container">
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 34px)`,
          gridTemplateRows: `repeat(${ROWS}, 34px)`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}

// React.memo prevents all 180 cells re-rendering on every paint stroke
const Cell = React.memo(function Cell({ r, c, blockType, blocks, isMouseDown, onPaint }) {
  const canvasRef = useRef(null)
  const divRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (blockType && blocks[blockType]) {
      if (!canvas) return
      drawBlock(canvas, blockType, blocks)
    }
  }, [blockType, blocks])

  const bg = blockType ? 'transparent' : cellBg(r)

  return (
    <div
      ref={divRef}
      className="cell"
      style={{ background: bg }}
      onMouseDown={e => {
        isMouseDown.current = true
        onPaint(r, c, divRef.current)
        e.preventDefault()
      }}
      onMouseEnter={() => {
        if (isMouseDown.current) onPaint(r, c, divRef.current)
      }}
      onTouchStart={e => {
        onPaint(r, c, divRef.current)
        e.preventDefault()
      }}
    >
      {blockType && blocks[blockType] && <canvas ref={canvasRef} />}
    </div>
  )
})
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WorldGrid.jsx
git commit -m "feat: add WorldGrid with mouse/touch drag painting"
```

---

## Task 9: Particles + CreeperPopup

**Files:**
- Create: `src/components/Particles.jsx`
- Create: `src/components/CreeperPopup.jsx`

These are kept imperative/portal-style to match original behaviour.

- [ ] **Step 1: Create `src/components/Particles.jsx`**

```jsx
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
```

- [ ] **Step 2: Create `src/components/CreeperPopup.jsx`**

```jsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Particles.jsx src/components/CreeperPopup.jsx
git commit -m "feat: add Particles (imperative ref) and CreeperPopup components"
```

---

## Task 10: WorldPanel — world action buttons + surprise

**Files:**
- Create: `src/components/WorldPanel.jsx`

WorldPanel composes Score, Toolbar, action buttons (Eraser, Surprise, Save, Clear), and WorldGrid. It also contains the 5 surprise drawing functions.

- [ ] **Step 1: Create `src/components/WorldPanel.jsx`**

```jsx
import Score from './Score'
import Toolbar from './Toolbar'
import WorldGrid from './WorldGrid'
import { playExplosion } from '../lib/sounds'

const COLS = 18
const ROWS = 10

// ── Surprise drawings ──────────────────────────────────────────────────────
function applyCreeper(state) {
  const next = state.map(row => [...row])
  const ox = 6, oy = 1
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) next[oy + r][ox + c] = 'leaves'
  next[oy+1][ox+1]='dirt';next[oy+1][ox+3]='dirt';next[oy+2][ox+2]='dirt'
  next[oy+3][ox+1]='dirt';next[oy+3][ox+2]='dirt';next[oy+3][ox+3]='dirt'
  for (let r = 4; r < 8; r++) for (let c = 1; c < 4; c++) next[oy+r][ox+c] = 'leaves'
  next[oy+8][ox+1]='leaves';next[oy+8][ox+3]='leaves'
  return next
}
function applyPig(state) {
  const next = state.map(row => [...row])
  const ox = 6, oy = 2
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) next[oy+r][ox+c] = 'dirt'
  next[oy][ox+1]='stone';next[oy][ox+3]='stone';next[oy+1][ox+2]='wood'
  next[oy+2][ox+1]='wood';next[oy+2][ox+2]='wood';next[oy+2][ox+3]='wood'
  for (let r = 3; r < 6; r++) for (let c = 0; c < 5; c++) next[oy+r][ox+c] = 'dirt'
  next[oy+6][ox]='dirt';next[oy+6][ox+1]='dirt';next[oy+6][ox+3]='dirt';next[oy+6][ox+4]='dirt'
  return next
}
function applySteve(state) {
  const next = state.map(row => [...row])
  const ox = 7, oy = 0
  for (let c = 0; c < 4; c++) next[oy][ox+c] = 'wood'
  next[oy+1][ox]='wood';next[oy+1][ox+1]='dirt';next[oy+1][ox+2]='dirt';next[oy+1][ox+3]='wood'
  next[oy+2][ox]='dirt';next[oy+2][ox+1]='water';next[oy+2][ox+2]='water';next[oy+2][ox+3]='dirt'
  for (let c = 0; c < 4; c++) next[oy+3][ox+c] = 'dirt'
  for (let r = 4; r < 7; r++) for (let c = 0; c < 4; c++) next[oy+r][ox+c] = 'water'
  for (let r = 7; r < 9; r++) for (let c = 0; c < 4; c++) next[oy+r][ox+c] = 'stone'
  for (let c = 0; c < 4; c++) next[oy+9][ox+c] = 'wood'
  return next
}
function applyHouse(state) {
  const next = state.map(row => [...row])
  const ox = 4, oy = 3
  for (let r = 0; r < 5; r++) for (let c = 0; c < 9; c++) next[oy+r][ox+c] = 'wood'
  next[oy+3][ox+4]='dirt';next[oy+4][ox+4]='dirt'
  next[oy+2][ox+2]='water';next[oy+2][ox+6]='water'
  ;[[1,2,3,4,5,6,7],[2,3,4,5,6],[3,4,5],[4]].forEach((cols, ri) =>
    cols.forEach(c => { if (oy-1-ri >= 0) next[oy-1-ri][ox+c] = 'stone' }))
  return next
}
function applyTree(state) {
  const next = state.map(row => [...row])
  const ox = 8, oy = 0
  for (let r = 0; r < 4; r++) {
    const w = r < 2 ? 5 : 3, off = r < 2 ? -2 : -1
    for (let c = 0; c < w; c++) next[oy+r][ox+off+c] = 'leaves'
  }
  for (let r = 4; r < 9; r++) next[oy+r][ox] = 'wood'
  for (let c = ox-3; c <= ox+3; c++) if (c >= 0 && c < COLS) next[9][c] = 'grass'
  return next
}

const SURPRISES = [
  { fn: applyCreeper, name: 'Creeper!' },
  { fn: applyPig,     name: 'Pig!' },
  { fn: applySteve,   name: 'Steve!' },
  { fn: applyHouse,   name: 'House!' },
  { fn: applyTree,    name: 'Tree!' },
]

export function countBlocks(state) {
  return state.flat().filter(Boolean).length
}

export default function WorldPanel({
  blocks,
  selectedBlock,
  isEraser,
  gridState,
  blockCount,
  onGridChange,
  onBlockCountChange,
  onSelectBlock,
  onSelectEraser,
  onOpenSaveModal,
  onDeleteCustomBlock,
  onPopup,
  particlesRef,
}) {
  function handleClear() {
    playExplosion()
    const empty = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    onGridChange(empty)
    onBlockCountChange(0)
    particlesRef.current?.spawnExplosion()
  }

  function handleSurprise() {
    playExplosion()
    const empty = Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
    const idx = Math.floor(Math.random() * SURPRISES.length)
    const { fn, name } = SURPRISES[idx]
    const next = fn(empty)
    onGridChange(next)
    onBlockCountChange(countBlocks(next))
    particlesRef.current?.spawnExplosion()
    onPopup({ message: name, style: { fontSize: '24px', color: '#fff', textShadow: '3px 3px 0 #000' } })
  }

  function handleSpawnParticles(cellEl) {
    const colors = selectedBlock && blocks[selectedBlock]?.colors[0]
    particlesRef.current?.spawn(cellEl, colors)
  }

  return (
    <div id="world-panel">
      <Score count={blockCount} />
      <Toolbar
        blocks={blocks}
        selectedBlock={selectedBlock}
        onSelect={onSelectBlock}
        onDelete={onDeleteCustomBlock}
      />
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
        <button className="ctrl-btn btn-surprise" onClick={handleSurprise}>⭐ SURPRISE!</button>
        <button className="ctrl-btn btn-save" onClick={() => onOpenSaveModal('world')}>💾 SAVE</button>
        <button className="ctrl-btn btn-clear" onClick={handleClear}>💥 CLEAR</button>
      </div>
      <WorldGrid
        gridState={gridState}
        onGridChange={onGridChange}
        blocks={blocks}
        selectedBlock={selectedBlock}
        isEraser={isEraser}
        onBlockCountChange={onBlockCountChange}
        onSpawnParticles={handleSpawnParticles}
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/WorldPanel.jsx
git commit -m "feat: add WorldPanel with world controls and surprise drawings"
```

---

## Task 11: ColorPalette + BBGrid + BlockPanel

**Files:**
- Create: `src/components/ColorPalette.jsx`
- Create: `src/components/BBGrid.jsx`
- Create: `src/components/BlockPanel.jsx`

- [ ] **Step 1: Create `src/components/ColorPalette.jsx`**

```jsx
import { useRef } from 'react'
import { PALETTE } from '../lib/palette'

export default function ColorPalette({ selectedColor, isEraser, onSelectColor, onSelectEraser }) {
  const colorInputRef = useRef(null)

  return (
    <div className="color-palette" id="color-palette">
      {PALETTE.map(({ hex, name }) => (
        <div
          key={hex}
          className={`color-swatch${!isEraser && selectedColor === hex ? ' selected' : ''}`}
          style={{ background: hex }}
          data-color={hex}
          onClick={() => onSelectColor(hex)}
        >
          <span className="sw-tip">{name}</span>
        </div>
      ))}

      {/* Custom colour picker */}
      <div
        id="swatch-custom"
        className={`color-swatch${!isEraser && !PALETTE.find(p => p.hex === selectedColor) ? ' selected' : ''}`}
        style={!isEraser && !PALETTE.find(p => p.hex === selectedColor) ? { background: selectedColor } : {}}
        onClick={() => colorInputRef.current?.click()}
      >
        <span className="sw-tip">Custom Color</span>
        🎨
      </div>

      {/* Eraser swatch */}
      <div
        id="swatch-eraser"
        className={`color-swatch${isEraser ? ' selected' : ''}`}
        onClick={onSelectEraser}
      >
        <span className="sw-tip">Eraser (Gray)</span>
        🧹
      </div>

      <input
        ref={colorInputRef}
        type="color"
        id="custom-color-input"
        defaultValue="#ff0000"
        onChange={e => onSelectColor(e.target.value)}
      />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/BBGrid.jsx`**

```jsx
import { useRef, useCallback, useEffect } from 'react'

const BB_SIZE = 8

export default function BBGrid({ bbState, onBBChange, selectedColor, isEraser }) {
  const isMouseDown = useRef(false)

  const paint = useCallback((r, c) => {
    const color = isEraser ? null : selectedColor
    const next = bbState.map(row => [...row])
    next[r][c] = color
    onBBChange(next)
  }, [bbState, onBBChange, selectedColor, isEraser])

  useEffect(() => {
    const up = () => { isMouseDown.current = false }
    document.addEventListener('mouseup', up)
    return () => document.removeEventListener('mouseup', up)
  }, [])

  const cells = []
  for (let r = 0; r < BB_SIZE; r++) {
    for (let c = 0; c < BB_SIZE; c++) {
      const color = bbState[r][c]
      cells.push(
        <div
          key={`${r}-${c}`}
          className="bb-cell"
          style={{ background: color ?? '' }}
          onMouseDown={e => { isMouseDown.current = true; paint(r, c); e.preventDefault() }}
          onMouseEnter={() => { if (isMouseDown.current) paint(r, c) }}
          onTouchStart={e => { paint(r, c); e.preventDefault() }}
        />
      )
    }
  }

  return (
    <div className="bb-grid-container">
      <div
        className="bb-grid"
        style={{
          gridTemplateColumns: `repeat(${BB_SIZE}, 40px)`,
          gridTemplateRows: `repeat(${BB_SIZE}, 40px)`,
        }}
      >
        {cells}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/components/BlockPanel.jsx`**

```jsx
import ColorPalette from './ColorPalette'
import BBGrid from './BBGrid'

export default function BlockPanel({
  bbState,
  onBBChange,
  selectedColor,
  isEraser,
  onSelectColor,
  onSelectEraser,
  onOpenSaveModal,
}) {
  function handleClear() {
    const empty = Array(8).fill(null).map(() => Array(8).fill(null))
    onBBChange(empty)
  }

  return (
    <div id="block-panel" className="visible">
      <div className="bb-label">Paint your own block! 🖌️ Then hit SAVE BLOCK to add it to the toolbar.</div>
      <ColorPalette
        selectedColor={selectedColor}
        isEraser={isEraser}
        onSelectColor={onSelectColor}
        onSelectEraser={onSelectEraser}
      />
      <div className="controls">
        <button className="ctrl-btn btn-eraser" onClick={onSelectEraser}>🧹 ERASER</button>
        <button className="ctrl-btn btn-clear" onClick={handleClear}>🔄 CLEAR</button>
        <button className="ctrl-btn btn-save-block" onClick={() => onOpenSaveModal('block')}>🧱 SAVE BLOCK</button>
      </div>
      <BBGrid
        bbState={bbState}
        onBBChange={onBBChange}
        selectedColor={selectedColor}
        isEraser={isEraser}
      />
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/ColorPalette.jsx src/components/BBGrid.jsx src/components/BlockPanel.jsx
git commit -m "feat: add ColorPalette, BBGrid, and BlockPanel components"
```

---

## Task 12: Sidebar + TemplateCard

**Files:**
- Create: `src/components/TemplateCard.jsx`
- Create: `src/components/Sidebar.jsx`

- [ ] **Step 1: Create `src/components/TemplateCard.jsx`**

```jsx
import { useEffect, useRef } from 'react'
import { buildPreviewCanvas } from '../lib/blocks'

const COLS = 18
const ROWS = 10

export default function TemplateCard({ template, blocks, onLoad, onDelete }) {
  const previewRef = useRef(null)

  useEffect(() => {
    if (!previewRef.current) return
    const canvas = buildPreviewCanvas(template.state, blocks, COLS, ROWS)
    canvas.className = 'template-preview'
    const container = previewRef.current
    container.innerHTML = ''
    container.appendChild(canvas)
  }, [template.state, blocks])

  return (
    <div className="template-card" onClick={onLoad}>
      <div className="template-name">{template.name}</div>
      <div ref={previewRef} />
      <div className="template-actions">
        <button className="tpl-btn tpl-load" onClick={e => { e.stopPropagation(); onLoad() }}>▶ LOAD</button>
        <button className="tpl-btn tpl-delete" onClick={e => { e.stopPropagation(); onDelete() }}>✕ DEL</button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `src/components/Sidebar.jsx`**

```jsx
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
```

- [ ] **Step 3: Commit**

```bash
git add src/components/TemplateCard.jsx src/components/Sidebar.jsx
git commit -m "feat: add Sidebar and TemplateCard with canvas previews"
```

---

## Task 13: SaveModal

**Files:**
- Create: `src/components/SaveModal.jsx`

- [ ] **Step 1: Create `src/components/SaveModal.jsx`**

```jsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SaveModal.jsx
git commit -m "feat: add SaveModal component"
```

---

## Task 14: App.jsx — wire everything together

**Files:**
- Modify: `src/App.jsx`

This is the orchestration layer. It owns all top-level state and connects every component.

- [ ] **Step 1: Write `src/App.jsx`**

```jsx
import { useState, useRef, useMemo, useCallback } from 'react'
import { BUILT_IN_BLOCKS } from './lib/blocks'
import { playFanfare } from './lib/sounds'
import { useTemplates, useSaveTemplate, useDeleteTemplate } from './hooks/useTemplates'
import { useCustomBlocks, useSaveCustomBlock, useDeleteCustomBlock } from './hooks/useCustomBlocks'

import Clouds from './components/Clouds'
import Ground from './components/Ground'
import Header from './components/Header'
import ModeToggle from './components/ModeToggle'
import WorldPanel from './components/WorldPanel'
import BlockPanel from './components/BlockPanel'
import Sidebar from './components/Sidebar'
import SaveModal from './components/SaveModal'
import Particles from './components/Particles'
import CreeperPopup from './components/CreeperPopup'

const COLS = 18
const ROWS = 10
const BB_SIZE = 8

function emptyGrid() {
  return Array(ROWS).fill(null).map(() => Array(COLS).fill(null))
}

function emptyBB() {
  return Array(BB_SIZE).fill(null).map(() => Array(BB_SIZE).fill(null))
}

export default function App() {
  // ── Mode ──────────────────────────────────────────────────────────────────
  const [mode, setMode] = useState('world')

  // ── World grid ────────────────────────────────────────────────────────────
  const [gridState, setGridState] = useState(emptyGrid)
  const [blockCount, setBlockCount] = useState(0)
  const [selectedBlock, setSelectedBlock] = useState('grass')
  const [isEraser, setIsEraser] = useState(false)

  // ── Block builder ─────────────────────────────────────────────────────────
  const [bbState, setBBState] = useState(emptyBB)
  const [bbColor, setBBColor] = useState('#F9FFFE')
  const [bbEraser, setBBEraser] = useState(false)

  // ── Save modal ────────────────────────────────────────────────────────────
  const [saveModal, setSaveModal] = useState({ open: false, mode: 'world' })

  // ── Popup ─────────────────────────────────────────────────────────────────
  const [popup, setPopup] = useState(null)

  // ── Refs ──────────────────────────────────────────────────────────────────
  const particlesRef = useRef(null)

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: customBlocksList = [] } = useCustomBlocks()
  const { data: templates = [] } = useTemplates()
  const saveTemplate = useSaveTemplate()
  const deleteTemplate = useDeleteTemplate()
  const saveCustomBlock = useSaveCustomBlock()
  const deleteCustomBlock = useDeleteCustomBlock()

  // Merge custom blocks into the blocks map
  const blocks = useMemo(() => {
    const custom = {}
    customBlocksList.forEach(cb => {
      custom[cb.key] = { name: cb.name, colors: cb.colors, isCustom: true }
    })
    return { ...BUILT_IN_BLOCKS, ...custom }
  }, [customBlocksList])

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSelectBlock(key) {
    setIsEraser(false)
    setSelectedBlock(key)
  }

  function handleLoadTemplate(idx) {
    const tpl = templates[idx]
    if (!tpl) return
    const next = emptyGrid()
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (tpl.state[r]?.[c]) next[r][c] = tpl.state[r][c]
    setGridState(next)
    setBlockCount(next.flat().filter(Boolean).length)
    setMode('world')
    setPopup({
      message: tpl.name + ' loaded!',
      style: { fontSize: '14px', color: '#FFD700', textShadow: '2px 2px 0 #000' },
    })
  }

  async function handleSave(name) {
    setSaveModal({ open: false, mode: 'world' })
    if (saveModal.mode === 'block') {
      const key = 'custom_' + Date.now()
      const colors = bbState.map(row => [...row])
      await saveCustomBlock.mutateAsync({ key, name, colors })
      setBBState(emptyBB())
      setMode('world')
      handleSelectBlock(key)
      playFanfare()
      setPopup({
        message: name + ' added!',
        style: { fontSize: '14px', color: '#FFD700', textShadow: '2px 2px 0 #000' },
      })
    } else {
      const snapshot = gridState.map(row => [...row])
      await saveTemplate.mutateAsync({ name, state: snapshot })
      playFanfare()
    }
  }

  async function handleDeleteCustomBlock(key) {
    await deleteCustomBlock.mutateAsync(key)
    if (selectedBlock === key) {
      setSelectedBlock('grass')
      setIsEraser(false)
    }
  }

  async function handleDeleteTemplate(id) {
    await deleteTemplate.mutateAsync(id)
  }

  return (
    <>
      <Clouds />
      <div id="main-content">
        <Header />
        <ModeToggle mode={mode} setMode={setMode} />
        {mode === 'world' && (
          <WorldPanel
            blocks={blocks}
            selectedBlock={selectedBlock}
            isEraser={isEraser}
            gridState={gridState}
            blockCount={blockCount}
            onGridChange={setGridState}
            onBlockCountChange={setBlockCount}
            onSelectBlock={handleSelectBlock}
            onSelectEraser={() => { setIsEraser(true); setSelectedBlock(null) }}
            onOpenSaveModal={m => setSaveModal({ open: true, mode: m })}
            onDeleteCustomBlock={handleDeleteCustomBlock}
            onPopup={setPopup}
            particlesRef={particlesRef}
          />
        )}
        {mode === 'block' && (
          <BlockPanel
            bbState={bbState}
            onBBChange={setBBState}
            selectedColor={bbColor}
            isEraser={bbEraser}
            onSelectColor={c => { setBBColor(c); setBBEraser(false) }}
            onSelectEraser={() => setBBEraser(true)}
            onOpenSaveModal={m => setSaveModal({ open: true, mode: m })}
          />
        )}
      </div>
      <Sidebar
        templates={templates}
        blocks={blocks}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
      <Particles ref={particlesRef} />
      <Ground />
      <SaveModal
        isOpen={saveModal.open}
        pendingMode={saveModal.mode}
        templateCount={templates.length}
        customBlockCount={customBlocksList.length}
        onSave={handleSave}
        onCancel={() => setSaveModal({ open: false, mode: 'world' })}
      />

      {popup && (
        <CreeperPopupDismisser popup={popup} onDone={setPopup} />
      )}
    </>
  )
}

// Defined outside App so its identity is stable — prevents CreeperPopup's useEffect timer
// from resetting on every App re-render while the popup is visible.
function CreeperPopupDismisser({ popup, onDone }) {
  const handleDone = useCallback(() => onDone(null), [onDone])
  return <CreeperPopup message={popup.message} style={popup.style} onDone={handleDone} />
}
```

- [ ] **Step 2: Verify `npm run dev` — app should render and be fully functional**

Expected: Full Minecraft UI appears, clouds animate, blocks can be placed, templates load from Supabase

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: wire all components together in App.jsx"
```

---

## Task 15: GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: Ensure `CNAME` is included in the build output**

Vite automatically copies everything in `public/` to `dist/`. Move the CNAME file there:

```bash
mkdir -p public
cp CNAME public/CNAME
```

No changes to `vite.config.js` needed for this — Vite handles it automatically. The root `CNAME` can stay too for reference, but `public/CNAME` is what matters for the build.

- [ ] **Step 3: Commit**

```bash
git add .github/ vite.config.js
git commit -m "feat: add GitHub Actions workflow for GitHub Pages deployment"
```

---

## Task 16: Final verification — build must succeed

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected: All tests PASS

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: `dist/` directory created, no errors, `dist/CNAME` present

- [ ] **Step 3: Verify CNAME is in dist**

```bash
ls dist/CNAME
```

Expected: file exists with content `minecraft.harrisfamilydesigns.com`

- [ ] **Step 4: Final commit if any cleanup needed**

```bash
git add -A
git commit -m "chore: final cleanup and build verification"
```

---

## Checklist: Feature parity verification

Before declaring done, confirm each original feature works:

- [ ] Animated clouds (3 clouds with CSS animation)
- [ ] Pixel font header ("⛏ ARI'S MINECRAFT WORLD ⛏")
- [ ] Mode toggle between WORLD BUILDER and BLOCK BUILDER
- [ ] All 10 built-in blocks render correctly (8×8 canvas pixels)
- [ ] Block selection with gold glow on selected button
- [ ] Tooltip on block hover
- [ ] Mouse-drag painting on world grid (18×10)
- [ ] Touch painting support
- [ ] Eraser mode (world grid)
- [ ] Block count score display
- [ ] CLEAR button with explosion sound + particles
- [ ] SURPRISE button (Creeper/Pig/Steve/House/Tree)
- [ ] Block placement sound (Web Audio API)
- [ ] Particle effects on block placement
- [ ] SAVE button → name modal → saves to Supabase
- [ ] Sidebar shows saved templates with canvas previews
- [ ] LOAD button restores template to grid
- [ ] DEL button deletes template from Supabase
- [ ] BLOCK BUILDER mode (8×8 pixel grid)
- [ ] Color palette (24 preset colours)
- [ ] Custom colour picker swatch
- [ ] Eraser swatch in block builder
- [ ] SAVE BLOCK → name modal → saves custom block to Supabase
- [ ] Custom block appears in toolbar with ✕ delete badge
- [ ] Delete custom block removes it from Supabase + toolbar
- [ ] Creeper popup animation on save/load
- [ ] Fanfare sound on save
- [ ] Green ground bar at bottom
- [ ] `npm run build` succeeds
- [ ] `dist/CNAME` present
