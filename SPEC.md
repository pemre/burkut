# China Explorer — Proje Spesifikasyonu

## Genel Bakış

Çin tarihi, edebiyatı ve sinemasını interaktif bir zaman çizelgesi üzerinden keşfetmeye yarayan
Vite + React uygulaması.

---

## Mimari

### Veri Katmanı
- Her içerik öğesi `src/content/{grup}/{id}.md` formatında ayrı bir Markdown dosyasıdır.
- Her dosyanın başında **YAML Front Matter** bulunur; timeline metadata'sı buradan okunur.
- Ana menü gövde sayfaları `src/content/_index/{grup}.md` içindedir.
- `useMdLoader` hook'u `import.meta.glob` ile tüm dosyaları lazy index'ler.

### Front Matter Şeması
```yaml
---
id: string              # vis.js item id ile eşleşmeli
group: string           # Dynasties and States | Literature | Cinema | _index
title: string           # Sidebar ve ContentPanel başlığı
subtitle: string        # Tarih aralığı vs.
start: string           # vis.js ISO formatı: "-002070-01-01"
end: string
className: string       # vis.js className (opsiyonel)
type: string            # vis.js item type (default: range)
tags: [string]
location:
  lat: number
  lng: number
  label: string
polygon: [[lat, lng]]   # GeoJSON benzeri koordinat listesi (opsiyonel)
---
```

---

## Bileşenler

| Bileşen | Sorumluluk |
|---|---|
| `App` | Global state (selectedId, activeGroup), layout |
| `Sidebar` | Grup/item listesi, highlight, expand/collapse |
| `ContentPanel` | Seçilen id'nin markdown içeriğini render eder |
| `MapPanel` | OpenStreetMap üzerinde marker + polygon gösterir |
| `TimelinePanel` | vis.js Timeline, item select → onSelect callback |
| `useMdLoader` | Tüm .md dosyalarını index'ler, getContent(id) sağlar |

---

## State Akışı

```
TimelinePanel.onSelect(id)  ──►  App.selectedId = id
Sidebar.onSelectItem(id)    ──►  App.selectedId = id
Sidebar.onSelectGroup(grp)  ──►  App.activeGroup = grp, selectedId = null

App.selectedId ──► ContentPanel (içerik yükle)
              ──► MapPanel (konum göster)
              ──► TimelinePanel (focus + highlight)
              ──► Sidebar (item highlight)
```

---

## Test Stratejisi (Spec Driven)

### Test Dosyaları
- `src/hooks/useMdLoader.test.js`      – gray-matter parse, pathToId util
- `src/components/Sidebar/Sidebar.test.jsx`         – render, tıklama, highlight
- `src/components/ContentPanel/ContentPanel.test.jsx` – async içerik yükleme, fallback
- `src/components/MapPanel/MapPanel.test.jsx`       – konum render, react-leaflet mock
- `src/components/TimelinePanel/TimelinePanel.test.jsx` – buildItems saf fonksiyon

### Çalıştırma
```bash
npm test          # tek seferlik
npm run test:watch  # watch mode
npm run test:ui   # Vitest UI
npm run coverage  # kapsam raporu
```

### Yeni Item Eklerken Test Akışı
1. `src/content/{grup}/{id}.md` dosyasını yaz (front matter + içerik)
2. Varsa yeni bir bileşen davranışı için `*.test.jsx` güncelle
3. `npm test` ile kontrol et
4. Timeline ve sidebar otomatik güncellenir (hot-reload)

---

## Geliştirme Notları

- `import.meta.glob` argümanları **statik literal** olmalı; değişken kullanılamaz.
- `react-leaflet` jsdom'da tam render etmez; MapPanel testleri mock kullanır.
- vis-timeline'ın `destroy()` metodu unmount'ta çağrılmalı (memory leak önlemi).
- Yeni grup eklemek için: `src/config.js` → `groups` dizisine yeni `{ id, translationKey }` ekle ve `src/i18n/locales/*.json` dosyalarında çevirileri tanımla.
- Tüm UI string'leri `react-i18next` ile çevrilir; çeviri dosyaları `src/i18n/locales/` altındadır.
- Tema renkleri CSS custom properties ile yönetilir (`src/styles/global.css` → `:root`).

---

## Yapılacaklar / Roadmap

- [ ] Arama çubuğu (title + tag'e göre)
- [ ] GeoJSON polygon desteği (hanedan sınırları)
- [x] Dark/light tema toggle — GitHub Primer-inspired, CSS variables + ThemeContext + CartoDB tiles
- [ ] Mobil responsive düzen
- [x] i18n (Türkçe / İngilizce / Çince) — `react-i18next` ile merkezi config
- [ ] E2E testler (Playwright)

### UI

* Draggable/collapsible layout: Menu, map, timeline... They all should be able to collapsed and moved.

Further Considerations for Themes

* vis-timeline iç stilleri — vis-timeline kendi panel border, axis text, group bg renklerini inline/class ile enjekte eder. Bunları override etmek !important gerektirebilir; alternatif olarak Timeline options parametresine tema uyumlu CSS class'ı verilebilir. Öneri: CSS override + !important en az invaziv çözüm.
* useTheme hook vs. CSS-only — MapPanel tile URL değişimi JS gerektirir, bu yüzden minimal bir useTheme custom hook (document attribute dinleyen MutationObserver veya basit state) oluşturulabilir; ya da ThemeToggle'dan bir React context yayılabilir. Öneri: Basit bir ThemeContext ile context approach daha temiz olur, MapPanel ve potansiyel gelecek bileşenler de kullanabilir.

### Translations

Further Considerations

* react-i18next vs react-intl? react-i18next is simpler (plain JSON, no ICU syntax needed), has a smaller footprint, and is the most popular React i18n library. react-intl is better if you need advanced pluralization/number formatting. I recommend react-i18next for this project's needs.
* Markdown content translation — this plan only covers UI chrome. Translating the actual .md content would require parallel content folders (e.g. src/content/en/, src/content/tr/) and is a separate, larger effort for later.
* vis-timeline group label reactivity — vis.js DataSet doesn't auto-react to React state. When language changes, the groups DataSet must be explicitly updated (.clear() + .add()), or the Timeline re-initialized. A useEffect on i18n.language can handle this
* dynamic index.html title tag
