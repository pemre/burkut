import { describe, it, expect, vi, beforeEach } from "vitest";
import matter from "gray-matter";

/**
 * SPEC: useMdLoader
 * -----------------
 * 1. Tüm .md dosyalarını tarar ve frontmatter'ı index'e ekler
 * 2. getContent(id) markdown body döner (frontmatter hariç)
 * 3. Geçersiz id için getContent null döner
 */

// gray-matter ile parse testi (hook'tan bağımsız unit)
describe("gray-matter parse", () => {
  it("frontmatter'ı doğru parse eder", () => {
    const raw = `---
id: xia
group: Dynasties and States
title: "Xia Hanedanı"
start: "-002070-01-01"
end: "-001600-01-01"
---

# Xia Hanedanı

İçerik buraya.`;

    const { data, content } = matter(raw);
    expect(data.id).toBe("xia");
    expect(data.group).toBe("Dynasties and States");
    expect(content.trim()).toContain("# Xia Hanedanı");
  });

  it("frontmatter yoksa data boş obje döner", () => {
    const raw = "# Sadece içerik\n\nMetadata yok.";
    const { data, content } = matter(raw);
    expect(data).toEqual({});
    expect(content).toContain("Sadece içerik");
  });

  it("location objesi parse edilir", () => {
    const raw = `---
id: shang
location:
  lat: 36.1
  lng: 114.3
  label: "Yinxu (Anyang)"
---
İçerik`;
    const { data } = matter(raw);
    expect(data.location.lat).toBe(36.1);
    expect(data.location.label).toBe("Yinxu (Anyang)");
  });
});

describe("pathToId util", () => {
  it("dosya yolundan id çıkarır", () => {
    const pathToId = (path) => path.split("/").pop().replace(".md", "");
    expect(pathToId("../content/hanedanlar/xia.md")).toBe("xia");
    expect(pathToId("../content/sinema/cinema_1.md")).toBe("cinema_1");
    expect(pathToId("../content/_index/hanedanlar.md")).toBe("hanedanlar");
  });
});
