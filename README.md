## 🦅 Bürküt — History Explorer

**Bürküt** takes its name from the golden eagle of Turkic mythology — the *ongon* of khans, the earthly eye of Tengri, the divine scout that soared above the steppe and saw everything below. That is exactly what this project sets out to be: a bird's-eye view of human history. Built on an interactive timeline, Bürküt lets you explore civilisations, dynasties, empires, literary movements, and cultural milestones across every age and every corner of the world — not as isolated facts, but as overlapping, breathing, interconnected layers of time.

Under the hood, every entry lives as a plain Markdown file with YAML front matter that drives the timeline, the map, and the detail panel simultaneously. No database, no backend, no CMS. Just structured text that a historian, a student, or a curious mind can open in any editor and extend in minutes. Bürküt is designed to grow: new countries, new civilisations, new categories — all added by dropping a single `.md` file into the right folder. The eagle keeps expanding its view.

This project started as something personal: a trip to China was coming up, and a timeline felt like the most honest way to actually understand what you are walking through — which dynasty built that wall, which poet lived in that city, which film was set in that era. But once the structure was in place, it became clear that the same approach works for any country, any civilisation, any period. Bürküt is now built to hold all of it.

***

> *"Rise above time. See everything."*
> **Bürküt — History Explorer**

***

## Features

- ⚡ **Instant loading** — all content pre-parsed at build time via a custom Vite plugin, zero runtime fetches
- 🔀 **Draggable & collapsible panels** — resize and collapse Sidebar, Map, and Timeline by dragging boundaries; layout persisted to `localStorage`
- 🌗 **Dark / Light theme toggle** — GitHub Primer-inspired, CSS variables + ThemeContext + CartoDB tiles
- 🌐 **i18n** — Turkish, English, and Chinese via `react-i18next`
- 📝 **Markdown-driven content** — add entries by dropping a `.md` file with YAML front matter
- 🗺️ **Interactive map** — Leaflet-based with markers and polygons
- 📅 **Interactive timeline** — vis.js powered, grouped by category

## Installation

```bash
npm install
npm run dev
```

## Testing

```bash
npm test            # run all tests
npm run test:ui     # Vitest UI panel
npm run coverage    # coverage report
```

## Adding Content

### Adding an item
Create a `src/content/{Group}/{id}.md` file with YAML front matter — the app updates automatically.

### Adding a new group
1. Add a `{ id, translationKey }` entry to `groups` in `src/config.ts`.
2. Add translations in `src/i18n/locales/*.json`.
3. Create a **group header file** at `src/content/{Group}.md` — its filename must match the group `id` exactly (case-sensitive). This markdown is displayed when the group header is clicked in the sidebar.
4. Create a subfolder `src/content/{Group}/` for individual items.

### Adding map polygons

1. Find a reference map image for the dynasty/state on Wikipedia.
2. Open [geojson.io](https://geojson.io/).
3. In your browser DevTools, set the map canvas to **50 % opacity** and add the Wikipedia image as a CSS `background-image` so you can trace over it.
4. Draw the polygon on geojson.io, tracing the historical borders from the reference image.
5. Export the result as **GeoJSON**.
6. Open the included `geojson-converter.html` tool in your browser — it reverses coordinate order (GeoJSON `[lng, lat]` → Leaflet `[lat, lng]`) and simplifies the polygon data.
7. Paste the converter output into the `polygon` field of the corresponding `.md` file's YAML front matter.

### Content structure
```
src/content/
  Cinema.md                ← group header (shown when "Cinema" is clicked)
  Cinema/                  ← sub-content items
    Hero (2002).md
    ...
  Dynasties and States.md  ← group header
  Dynasties and States/    ← sub-content items
    xia.md
    ...
  Literature.md            ← group header (no subfolder yet)
```

See `SPEC.md` for the full content schema and architecture details.

## Quality Gates

All code is written in **TypeScript** (strict mode) and linted/formatted by **Biome**.

```bash
npx tsc --noEmit           # zero type errors
npx biome check src        # zero diagnostics (lint + format)
npm test                   # all tests pass
npm run build              # production build succeeds
```

***

*Built with TypeScript + Vite + React + vis.js + react-leaflet + Biome. Markdown-driven, no backend required.*
