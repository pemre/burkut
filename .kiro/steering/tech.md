# Tech Stack & Build

## Core Stack

| Layer | Technology |
|-------|------------|
| Language | TypeScript (strict mode) |
| Framework | React 18 |
| Bundler | Vite 5 |
| Timeline | vis-timeline / vis-data |
| Map | react-leaflet + Leaflet |
| Markdown | react-markdown + remark-gfm |
| i18n | react-i18next |
| Icons | lucide-react |
| Layout | react-resizable-panels |
| Styling | Plain CSS with custom properties (no CSS-in-JS) |
| Linting/Formatting | Biome |
| Testing | Vitest + @testing-library/react + jsdom |

## Commands

```bash
npm run dev          # Start dev server (Vite)
npm run build        # Production build
npm run preview      # Preview production build
npm test             # Run all tests (vitest run, single pass)
npm run test:watch   # Vitest in watch mode
npm run test:ui      # Vitest UI
npm run coverage     # Coverage report (v8)
npm run typecheck    # tsc --noEmit
npm run lint         # biome check src
npm run lint:fix     # biome check --fix src
npm run format       # biome format --write src
```

## Quality Gates (must all pass before merge)

```bash
npx tsc --noEmit        # zero type errors
npx biome check src     # zero diagnostics
npm test                # all tests pass
npm run build           # production build succeeds
```

## Biome Configuration

- Indent: 2 spaces
- Line width: 100
- Quotes: double
- Semicolons: always
- Import organization: auto via `assist.actions.source.organizeImports`
- Key lint rules enforced: `useButtonType`, `useAriaPropsSupportedByRole`, `noSvgWithoutTitle`, `noNonNullAssertion`, `noImplicitAnyLet`

## TypeScript

- Target: ES2020, strict mode enabled
- JSX: react-jsx
- Module resolution: bundler
- `allowImportingTsExtensions` is enabled

## Custom Vite Plugin

`vite-plugins/md-content.ts` scans all `.md` files under `src/content/`, parses them with `gray-matter` at build/dev time, and serves them as a single virtual module (`virtual:md-content`). This keeps `gray-matter` and `Buffer` out of the browser bundle. The plugin watches the content directory for HMR.
