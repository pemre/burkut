## 🦅 Bürküt — History Explorer

**Bürküt** takes its name from the golden eagle of Turkic mythology — the *ongon* of khans, the earthly eye of Tengri, the divine scout that soared above the steppe and saw everything below. That is exactly what this project sets out to be: a bird's-eye view of human history.

Bürküt lets you explore civilisations, dynasties, empires, literary movements, and cultural milestones across every age through an interactive timeline, map, and detail panel. Every entry lives as a plain Markdown file with YAML front matter — no database, no backend, no CMS. New content is added by dropping a single `.md` file into the right folder.

It started as something personal: a trip to China was coming up, and a timeline felt like the most honest way to understand what you're walking through — which dynasty built that wall, which poet lived in that city, which film was set in that era. Once the structure was in place, it became clear the same approach works for any country, any civilisation, any period.

> *"Rise above time. See everything."*

---

## Features

- ⚡ Instant loading — all content pre-parsed at build time, zero runtime fetches
- 🔀 Draggable & resizable widget grid — rearrange Sidebar, Content, Map, and Timeline widgets; layout and visibility persisted to localStorage
- 🌗 Dark / Light theme toggle
- 🌐 i18n — Turkish, English, and Chinese
- 📝 Markdown-driven content with YAML front matter
- 🗺️ Interactive map (Leaflet) with markers and polygons
- 📅 Interactive timeline (vis.js), grouped by category
- ✓ Reading progress tracker with new-content detection

## Roadmap

- [x] ~~Use react-grid-layout as a widget system instead of draggable panels~~
- [ ] Custom localization for Vis.js based on app language
- [ ] Search bar (by title + tag)
- [ ] E2E tests (Playwright)
- [ ] Mobile responsive layout

## Quick Start

```bash
npm install
npm run dev
```

## Testing & Quality

```bash
npm test                # all tests (single run)
npm run coverage        # coverage report
npm run typecheck       # tsc --noEmit
npm run lint            # biome check src
npm run build           # production build
```

All four must pass before merging. See [.kiro/steering/tech.md](.kiro/steering/tech.md) for the full command reference and Biome config.

## Adding Content

Create `src/content/{Group}/{title}.md` with YAML front matter — the app picks it up automatically.

To add a new group:
1. Add `{ id, translationKey }` to `groups` in `src/config.ts`
2. Add translations in `src/i18n/locales/*.json`
3. Create a group header at `src/content/{Group}.md`
4. Create the subfolder `src/content/{Group}/`

### Front Matter Schema

```yaml
---
id: string
group: string           # must match a config group id
title: string
subtitle: string
start: string           # vis.js ISO format, e.g. "-002070-01-01"
end: string
className: string       # optional
type: string            # default: range
tags: [string]
location:
  lat: number
  lng: number
  label: string
polygon: [[lat, lng]]   # optional, for map borders
sidebarSort: string     # header files only: "start" or omit for alphabetical
---
```

## Design System

Bürküt uses a three-tier design token architecture (core → semantic → component) and reusable UI primitives in `src/components/ui/`. See the [Design System Guidelines](src/components/ui/GUIDELINES.md) for token naming conventions, component APIs, and patterns for extending the system.

## Documentation

Detailed project documentation lives in `.kiro/steering/`:

| File | Contents |
|------|----------|
| [product.md](.kiro/steering/product.md) | Product overview, key concepts, feature flags |
| [tech.md](.kiro/steering/tech.md) | Tech stack, build commands, quality gates, Biome & TS config |
| [structure.md](.kiro/steering/structure.md) | Project layout, component conventions, coding patterns |

These steering files are the source of truth for architecture decisions and project conventions.

---

*Built with TypeScript + Vite + React + react-grid-layout + vis.js + react-leaflet + Biome. Markdown-driven, no backend required.*
