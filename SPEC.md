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
group: string           # Hanedanlar | Edebiyat | Sinema | _index
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
- Yeni grup eklemek için: `GROUPS` array'ini `TimelinePanel` ve `Sidebar`'da güncelle.

---

## Yapılacaklar / Roadmap

- [ ] Arama çubuğu (title + tag'e göre)
- [ ] GeoJSON polygon desteği (hanedan sınırları)
- [ ] Dark/light tema toggle
- [ ] Mobil responsive düzen
- [ ] i18n (Türkçe / İngilizce / Çince)
- [ ] E2E testler (Playwright)
