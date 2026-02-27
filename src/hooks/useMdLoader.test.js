import { describe, it, expect } from "vitest";
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
  const pathToId = (path) => path.split("/").pop().replace(".md", "");

  it("dosya yolundan id çıkarır (subfolder item)", () => {
    expect(pathToId("../content/Dynasties and States/xia.md")).toBe("xia");
    expect(pathToId("../content/Cinema/Hero (2002).md")).toBe("Hero (2002)");
  });

  it("header dosyasından id çıkarır (depth-1)", () => {
    expect(pathToId("../content/Cinema.md")).toBe("Cinema");
    expect(pathToId("../content/Dynasties and States.md")).toBe("Dynasties and States");
    expect(pathToId("../content/Literature.md")).toBe("Literature");
  });
});

describe("isHeaderPath util", () => {
  const CONTENT_PREFIX = "../content/";
  const isHeaderPath = (path) => {
    const rel = path.slice(CONTENT_PREFIX.length);
    return !rel.includes("/");
  };

  it("depth-1 dosyaları header olarak tanır", () => {
    expect(isHeaderPath("../content/Cinema.md")).toBe(true);
    expect(isHeaderPath("../content/Dynasties and States.md")).toBe(true);
    expect(isHeaderPath("../content/Literature.md")).toBe(true);
  });

  it("subfolder dosyaları header olarak tanımaz", () => {
    expect(isHeaderPath("../content/Cinema/Hero (2002).md")).toBe(false);
    expect(isHeaderPath("../content/Dynasties and States/xia.md")).toBe(false);
  });
});
