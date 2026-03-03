# Project Structure

```
├── src/
│   ├── App.tsx                  # Root component — global state, panel layout
│   ├── main.tsx                 # Entry point
│   ├── config.ts                # Centralized config: groups, feature flags, locales
│   ├── components/
│   │   ├── ContentPanel/        # Renders markdown content for selected item
│   │   ├── MapPanel/            # Leaflet map with markers + polygons
│   │   ├── Sidebar/             # Group/item navigation list
│   │   ├── TimelinePanel/       # vis-timeline integration
│   │   ├── PanelHeader/         # Reusable collapse/expand header strip
│   │   ├── ThemeToggle/         # Dark/light theme switch
│   │   ├── ProgressPie/         # SVG donut chart for reading progress
│   │   └── NewContentModal/     # Modal for newly detected content
│   ├── hooks/
│   │   ├── useMdLoader.ts       # Loads pre-parsed markdown from virtual module
│   │   ├── useProgress.ts       # Reading progress tracker (localStorage)
│   │   ├── useResizeObserver.ts  # Debounced ResizeObserver for panel redraws
│   │   └── useTheme.tsx         # Theme context provider
│   ├── i18n/
│   │   ├── index.ts             # i18next initialization
│   │   └── locales/             # Translation JSON files (tr, en, zh)
│   ├── content/                 # Markdown content files
│   │   ├── {Group}.md           # Group header (filename must match group id)
│   │   └── {Group}/             # Sub-content items
│   │       └── {Title}.md       # Individual content entries
│   ├── styles/
│   │   ├── global.css           # CSS custom properties, theme variables
│   │   └── layout.css           # App shell and panel layout styles
│   ├── types/                   # TypeScript declarations
│   └── tests/
│       └── setup.ts             # Vitest setup (jsdom, testing-library matchers)
├── vite-plugins/
│   └── md-content.ts            # Custom Vite plugin for markdown pre-parsing
├── vite.config.ts               # Vite + Vitest config
├── tsconfig.json                # TypeScript config (strict)
├── biome.json                   # Linter + formatter config
└── prompts/                     # AI prompt templates for feature development
```

## Conventions

- Each component lives in its own folder: `src/components/{Name}/{Name}.tsx` with co-located `.css` and `.test.tsx` files.
- Hooks live in `src/hooks/` with co-located `.test.ts` files.
- All UI strings go through `react-i18next` — never hardcode user-facing text.
- Content is added as `.md` files with YAML front matter. To add a new group: add to `config.groups`, add translations, create a header `.md` and subfolder.
- CSS uses custom properties defined in `global.css` for theming. No CSS-in-JS.
- `react-leaflet` doesn't render in jsdom — MapPanel tests use mocks.
- vis-timeline requires explicit `destroy()` on unmount to prevent memory leaks.
