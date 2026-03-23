# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Production build (outputs to dist/)
npm run preview      # Preview production build locally
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Architecture

**React 18 + Vite + Supabase** pixel art Minecraft builder for a child named Ari.

### State Management

`App.jsx` is the central state container — nearly all state lives here and flows down as props:
- `gridState`: 18×10 array of block type strings (the world)
- `bbGrid`: 8×8 array of hex color strings (custom block pixel editor)
- `mode`: `'world'` | `'block'` — which panel is active
- UI state: `selectedBlock`, `eraserMode`, `showSaveModal`, `popup`, etc.

React Query (`useTemplates`, `useCustomBlocks` hooks) handles Supabase fetch/save/delete with caching.

### Key Components

- **WorldGrid** — 18×10 painting canvas. Uses `React.memo` on Cell and `useCallback` with functional state updater to avoid stale closures during drag-paint.
- **BlockPanel / BBGrid** — 8×8 custom block pixel editor with 24-color palette.
- **Sidebar / TemplateCard** — lists saved builds; TemplateCard renders previews with Canvas API via `buildPreviewCanvas()`.
- **Particles** — imperative particle effects using `useRef` + canvas.
- **Toolbar** — shows built-in blocks + custom blocks fetched from Supabase.

### Core Libraries (`src/lib/`)

- **blocks.js** — Defines 10 built-in blocks as 8×8 color grids, plus `drawBlock()` and `buildPreviewCanvas()` canvas utilities.
- **sounds.js** — All audio is synthesized with the Web Audio API (no files). `AudioContext` must be closed after use.
- **palette.js** — 24-color array for the block builder.
- **supabase.js** — Supabase client (public anon key embedded, safe for client-side).

### Database (Supabase)

- `minecraft_builds` — `{ id, name, state (JSON 18×10), created_at }`
- `minecraft_custom_blocks` — `{ id, key (custom_<timestamp>), name, colors (JSON 8×8), created_at }`

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`. The site uses a custom domain configured via `public/CNAME`.

### Testing

Tests live alongside source in `src/lib/blocks.test.js`. The Vitest config uses jsdom. Run a single test file:
```bash
npx vitest run src/lib/blocks.test.js
```

## Gotchas

- **Canvas sizing**: Don't use `canvas.clientWidth`/`clientHeight` to set the draw buffer — it returns the default 300×150 if `position: fixed; inset: 0` hasn't applied yet. Use `window.innerWidth`/`innerHeight` directly in `onResize`.
- **`inset: 0` alone isn't enough**: Pair it with `width: 100%; height: 100%` on the canvas so older mobile browsers still fill the viewport.
- **Pinch vs tap on mobile**: Never paint on `touchstart` — wait for `touchmove` (drag) or `touchend` (tap) and track `multiTouchSeen` to suppress painting for the rest of any pinch gesture.
- **Stale closures in canvas callbacks**: All mutable state accessed inside imperative event handlers must be read via refs (e.g. `worldStateRef.current`), not captured by the single `useEffect` closure.
