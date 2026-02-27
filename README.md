## 🦅 Bürküt — History Explorer

**Bürküt** takes its name from the golden eagle of Turkic mythology — the *ongon* of khans, the earthly eye of Tengri, the divine scout that soared above the steppe and saw everything below. That is exactly what this project sets out to be: a bird's-eye view of human history. Built on an interactive timeline, Bürküt lets you explore civilisations, dynasties, empires, literary movements, and cultural milestones across every age and every corner of the world — not as isolated facts, but as overlapping, breathing, interconnected layers of time.

Under the hood, every entry lives as a plain Markdown file with YAML front matter that drives the timeline, the map, and the detail panel simultaneously. No database, no backend, no CMS. Just structured text that a historian, a student, or a curious mind can open in any editor and extend in minutes. Bürküt is designed to grow: new countries, new civilisations, new categories — all added by dropping a single `.md` file into the right folder. The eagle keeps expanding its view.

This project started as something personal: a trip to China was coming up, and a timeline felt like the most honest way to actually understand what you are walking through — which dynasty built that wall, which poet lived in that city, which film was set in that era. But once the structure was in place, it became clear that the same approach works for any country, any civilisation, any period. Bürküt is now built to hold all of it.

***

> *"Rise above time. See everything."*
> **Bürküt — History Explorer**

***

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

Create a `src/content/{group}/{id}.md` file, write the front matter — the app updates automatically.

See `SPEC.md` for the full content schema and architecture details.

***

*Built with Vite + React + vis.js + react-leaflet. Markdown-driven, no backend required.*

## Future

### Translations

Further Considerations

* react-i18next vs react-intl? react-i18next is simpler (plain JSON, no ICU syntax needed), has a smaller footprint, and is the most popular React i18n library. react-intl is better if you need advanced pluralization/number formatting. I recommend react-i18next for this project's needs.
* Markdown content translation — this plan only covers UI chrome. Translating the actual .md content would require parallel content folders (e.g. src/content/en/, src/content/tr/) and is a separate, larger effort for later.
* vis-timeline group label reactivity — vis.js DataSet doesn't auto-react to React state. When language changes, the groups DataSet must be explicitly updated (.clear() + .add()), or the Timeline re-initialized. A useEffect on i18n.language can handle this
* dynamic index.html title tag
