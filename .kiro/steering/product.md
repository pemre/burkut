# Product: Bürküt — History Explorer

Bürküt is an interactive history explorer that lets users browse civilisations, dynasties, empires, literary movements, and cultural milestones through a timeline, map, and detail panel.

All content is Markdown-driven (YAML front matter + body). No database or backend. New content is added by dropping a `.md` file into `src/content/{Group}/`. Group headers live at `src/content/{Group}.md`.

The app is deployed to GitHub Pages at https://pemre.github.io/burkut/.

## Key Concepts

- Content items are `.md` files parsed at build time by a custom Vite plugin (`vite-plugins/md-content.ts`) into a single virtual module — zero runtime fetches.
- Groups (e.g. "Dynasties and States", "Literature", "Cinema") are defined in `src/config.ts`.
- Feature flags in `config.features` control optional capabilities (search, dark/light toggle, draggable layout, progress tracker).
- i18n supports Turkish (default), English, and Chinese via `react-i18next`.
- Users can mark items as "read"; progress is tracked in localStorage and shown as an SVG donut chart.
