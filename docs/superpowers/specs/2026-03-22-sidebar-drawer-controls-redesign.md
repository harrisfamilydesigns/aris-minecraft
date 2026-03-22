# Sidebar Drawer & Controls Redesign

**Date:** 2026-03-22
**Status:** Approved

## Overview

Two UI improvements to make the app more usable on phone-sized screens:
1. Convert the "My Builds" sidebar from a fixed panel that pushes content into an overlay drawer
2. Move action controls (Eraser, Surprise, Save, Clear) to below the world/block builder grid

---

## 1. Sidebar → Overlay Drawer

### Behaviour

- The sidebar overlays content on **all screen sizes** — it no longer pushes `#main-content` left
- **Desktop (≥768px):** drawer defaults to open on first render
- **Mobile (<768px):** drawer defaults to closed on first render
- A semi-transparent backdrop renders behind the open drawer; clicking it closes the drawer
- The drawer slides in/out from the right with a CSS transition
- A close (✕) button inside the drawer header also closes it

### State

`sidebarOpen` boolean added to `App.jsx`:

```js
const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768)
```

`App.jsx` renders:
- A floating toggle button (always visible, fixed bottom-right)
- A backdrop `<div>` (visible only when `sidebarOpen`, closes drawer on click)
- `<Sidebar>` receives `isOpen` and `onClose` props

### CSS changes

- Remove `margin-right: 180px` from `#main-content`
- Add `transform: translateX(100%)` when closed, `translateX(0)` when open, with `transition: transform 0.25s ease`
- Backdrop: `position:fixed; inset:0; background:rgba(0,0,0,0.4); z-index:19`
- Floating toggle button: `position:fixed; bottom:52px; right:12px; z-index:30` (above ground bar at 40px)

---

## 2. Controls Below Grid / Builder

### WorldPanel

Move the `.controls` div from above `<WorldGrid>` to after it:

```
Score → Toolbar → WorldGrid → Controls (Eraser, Surprise, Save, Clear)
```

### BlockPanel

Move the `.controls` div from above `<BBGrid>` to after it:

```
Label → ColorPalette → BBGrid → Controls (Eraser, Clear, Save Block)
```

No style changes needed — JSX reorder only.

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.jsx` | Add `sidebarOpen` state, floating toggle button, backdrop div, pass `isOpen`/`onClose` to Sidebar |
| `src/components/Sidebar.jsx` | Accept `isOpen`/`onClose` props, add close button to header |
| `src/components/WorldPanel.jsx` | Move `.controls` div after `<WorldGrid />` |
| `src/components/BlockPanel.jsx` | Move `.controls` div after `<BBGrid />` |
| `src/styles/index.css` | Remove `margin-right`, add drawer slide transition, backdrop, floating button styles |
