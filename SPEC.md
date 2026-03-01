# Bürküt — History Explorer: Project Specification

## Overview

A Vite + React application for exploring civilisations, dynasties, empires, literary movements,
and cultural milestones across history through an interactive timeline, map, and detail panel.
Content is entirely Markdown-driven (YAML front matter + body); no database or backend required.
New countries, civilisations, or categories can be added by dropping a single `.md` file into
the appropriate folder.

---

## Architecture

### Data Layer
- Each content item is a separate Markdown file in the `src/content/{group}/{id}.md` format.
- Every file has a **YAML Front Matter** header from which timeline metadata is read.
- **Group header pages** live as `src/content/{Group}.md` — a `.md` file at the content root that shares its name with the subfolder. When a sidebar group is clicked (and no specific item is selected), the header file's content is displayed in ContentPanel.
- Sub-content items live in `src/content/{Group}/{id}.md` subfolders.
- The `useMdLoader` hook lazily indexes all files via `import.meta.glob` and detects header files by path depth (direct children of `content/` = headers).

### Front Matter Schema
```yaml
---
id: string              # must match the vis.js item id (header files: must match config group id exactly)
group: string           # e.g. Dynasties and States | Literature | Cinema
title: string           # title shown in Sidebar and ContentPanel
subtitle: string        # date range, etc.
start: string           # vis.js ISO format: "-002070-01-01"
end: string
className: string       # vis.js className (optional)
type: string            # vis.js item type (default: range)
tags: [string]
location:
  lat: number
  lng: number
  label: string
polygon: [[lat, lng]]   # GeoJSON-style coordinate list (optional)
---
```

---

## Components

| Component | Responsibility |
|---|---|
| `App` | Global state (selectedId, activeGroup), layout |
| `Sidebar` | Group/item list, highlight, expand/collapse |
| `ContentPanel` | Renders the markdown content of the selected id |
| `MapPanel` | Displays markers + polygons on OpenStreetMap |
| `TimelinePanel` | vis.js Timeline, item select → onSelect callback |
| `useMdLoader` | Indexes all .md files, provides getContent(id) |
| `PanelHeader` | Reusable ~32px collapse/expand strip with title + chevron toggle button |
| `useResizeObserver` | Debounced ResizeObserver hook; triggers Leaflet `invalidateSize()` and vis-timeline `redraw()` |
| `MapResizeWatcher` | Inner component in MapPanel; uses `useMap()` + `useResizeObserver` to self-contain resize logic |

---

## State Flow

```
TimelinePanel.onSelect(id)  ──►  App.selectedId = id
Sidebar.onSelectItem(id)    ──►  App.selectedId = id
Sidebar.onSelectGroup(grp)  ──►  App.activeGroup = grp, selectedId = null

App.selectedId ──► ContentPanel (load content)
              ──► MapPanel (show location)
              ──► TimelinePanel (focus + highlight)
              ──► Sidebar (item highlight)
```

---

## Test Strategy (Spec Driven)

### Test Files
- `src/hooks/useMdLoader.test.js`      – gray-matter parse, pathToId util
- `src/components/Sidebar/Sidebar.test.jsx`         – render, click, highlight
- `src/components/ContentPanel/ContentPanel.test.jsx` – async content loading, fallback
- `src/components/MapPanel/MapPanel.test.jsx`       – location render, react-leaflet mock
- `src/components/TimelinePanel/TimelinePanel.test.jsx` – buildItems pure function
- `src/hooks/useResizeObserver.test.js`                 – debounce behavior, cleanup, mocked ResizeObserver

### Running Tests
```bash
npm test          # single run
npm run test:watch  # watch mode
npm run test:ui   # Vitest UI
npm run coverage  # coverage report
```

### Test Flow When Adding a New Item
1. Write `src/content/{group}/{id}.md` (front matter + content)
2. Update `*.test.jsx` for any new component behavior
3. Verify with `npm test`
4. Timeline and sidebar update automatically (hot-reload)

---

## Development Notes

- `import.meta.glob` arguments must be **static literals**; variables cannot be used.
- `react-leaflet` does not fully render in jsdom; MapPanel tests use mocks.
- vis-timeline's `destroy()` method must be called on unmount (prevents memory leaks).
- To add a new group: add a new `{ id, translationKey }` entry to the `groups` array in `src/config.js` and define translations in `src/i18n/locales/*.json`.
- All UI strings are translated via `react-i18next`; translation files are under `src/i18n/locales/`.
- Theme colors are managed with CSS custom properties (`src/styles/global.css` → `:root`).

---

## Draggable Layout

### Overview
All panels (Sidebar, ContentPanel, MapPanel, TimelinePanel) can be resized by dragging the border between them and collapsed via a toggle button. Panel sizes are persisted to `localStorage` and restored on page reload. No panel reordering is supported.

### Dependency
`react-resizable-panels` (v4.x) — provides `Group`, `Panel`, `Separator`, and `useDefaultLayout`.

### Feature Flag
`config.features.draggableLayout` (default: `true`)

### Panel Structure
Three nested `Group` components, each persisted via `useDefaultLayout`:

```
Group (horizontal, id="layout-root")
├── Panel: Sidebar        (collapsible, defaultSize=15%, collapsedSize=2%)
├── Separator
└── Panel: Main area
    └── Group (vertical, id="layout-main")
        ├── Panel: Top panels
        │   └── Group (horizontal, id="layout-top")
        │       ├── Panel: ContentPanel
        │       ├── Separator
        │       └── Panel: MapPanel  (collapsible, defaultSize=35%, collapsedSize=2%)
        ├── Separator
        └── Panel: TimelinePanel     (collapsible, defaultSize=25%, collapsedSize=3%)
```

### Collapse Behavior
- **Sidebar**: collapses to a ~32px narrow strip showing a ☰ hamburger button for discoverability.
- **MapPanel**: collapses to a ~32px `PanelHeader` bar showing the panel title and an expand chevron.
- **TimelinePanel**: collapses to a ~32px `PanelHeader` bar showing the panel title and an expand chevron.
- Collapse/expand is controlled via imperative `panelRef` handles (`panel.collapse()` / `panel.expand()` / `panel.isCollapsed()`). Collapsed state is tracked with `useState` booleans, updated via `onResize` callbacks by checking `size.asPercentage`.

### Persistence
Each `Group` uses the `useDefaultLayout` hook with `localStorage` for saving/restoring panel sizes across page reloads.

### ResizeObserver Integration
- **MapPanel**: an inner `MapResizeWatcher` component uses `useMap()` (from `react-leaflet`) and `useResizeObserver` on the `.map-panel` wrapper div. On resize, it calls `map.invalidateSize()` so Leaflet redraws tiles correctly.
- **TimelinePanel**: `useResizeObserver` is called on `containerRef`. On resize, it calls `timelineRef.current.tl.redraw()` so vis-timeline adjusts to the new dimensions.
- Callbacks are debounced (~100ms) to avoid excessive redraws during drag.

### i18n
Panel title keys added to all locale files: `panels.sidebar`, `panels.content`, `panels.map`, `panels.timeline`.

---

## Roadmap

- [ ] Custom localization for Vis.js based on app language
- [ ] Search bar (by title + tag)
- [ ] GeoJSON polygon support (civilisation / territory borders)
- [x] Dark/light theme toggle — GitHub Primer-inspired, CSS variables + ThemeContext + CartoDB tiles
- [ ] Mobile responsive layout
- [x] i18n (Turkish / English / Chinese) — centralized config via `react-i18next`
- [ ] E2E tests (Playwright)

### UI

Further Considerations for Themes

* vis-timeline internal styles — vis-timeline injects its own panel border, axis text, and group background colors via inline styles/classes. Overriding them may require `!important`; alternatively, a theme-compatible CSS class can be passed to the Timeline `options` parameter. Recommendation: CSS override + `!important` is the least invasive solution.
* useTheme hook vs. CSS-only — Changing the MapPanel tile URL requires JavaScript, so a minimal `useTheme` custom hook can be created (using a MutationObserver that listens to a document attribute, or simple state); alternatively, a React context can be propagated from `ThemeToggle`. Recommendation: A simple `ThemeContext` approach is cleaner and can also be consumed by MapPanel and future components.

### Translations

Further Considerations

* react-i18next vs react-intl? react-i18next is simpler (plain JSON, no ICU syntax needed), has a smaller footprint, and is the most popular React i18n library. react-intl is better if you need advanced pluralization/number formatting. I recommend react-i18next for this project's needs.
* Markdown content translation — this plan only covers UI chrome. Translating the actual .md content would require parallel content folders (e.g. src/content/en/, src/content/tr/) and is a separate, larger effort for later.
* vis-timeline group label reactivity — vis.js DataSet doesn't auto-react to React state. When language changes, the groups DataSet must be explicitly updated (.clear() + .add()), or the Timeline re-initialized. A useEffect on i18n.language can handle this
* dynamic index.html title tag
