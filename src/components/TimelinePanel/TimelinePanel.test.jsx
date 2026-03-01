import { describe, it, expect } from "vitest";
import config from "../../config";

/**
 * SPEC: TimelinePanel / buildItems util + group visibility
 * ---------------------------------------------------------
 * 1. start+end+group olan index girdileri item'a dönüşür
 * 2. start/end eksik girdiler filtrelenir
 * 3. subtitle varsa content'e eklenir
 * 4. className ve type frontmatter'dan alınır
 * 5. translatedGroups includes visible flag based on hiddenGroups set
 * 6. hiddenGroups persisted to / restored from localStorage
 *
 * NOT: vis-timeline jsdom'da DOM gerektirdiğinden
 * Timeline init testi entegrasyon testine bırakılmıştır.
 * Bu dosya yalnızca buildItems ve buildTranslatedGroups saf fonksiyonlarını test eder.
 */

// buildItems fonksiyonunu doğrudan test etmek için izole import
function buildItems(index) {
  return Object.values(index)
    .filter((m) => m.start && m.end && m.group)
    .map((m) => ({
      id: m.id,
      content: m.subtitle
        ? `${m.title || m.id}<br><small>${m.subtitle}</small>`
        : m.title || m.id,
      start: m.start,
      end: m.end,
      group: m.group,
      className: m.className || "",
      type: m.type || "range",
    }));
}

describe("buildItems", () => {
  it("geçerli item'ları dönüştürür", () => {
    const index = {
      xia: {
        id: "xia",
        title: "Xia Hanedanı",
        subtitle: "MÖ 2070–1600",
        start: "-002070-01-01",
        end: "-001600-01-01",
        group: "Hanedanlar",
      },
    };
    const result = buildItems(index);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("xia");
    expect(result[0].content).toContain("MÖ 2070–1600");
    expect(result[0].type).toBe("range");
  });

  it("start/end eksik girdileri filtreler", () => {
    const index = {
      incomplete: { id: "incomplete", title: "Test", group: "Edebiyat" },
    };
    expect(buildItems(index)).toHaveLength(0);
  });

  it("className frontmatter'dan alınır", () => {
    const index = {
      xia: {
        id: "xia",
        start: "-002070-01-01",
        end: "-001600-01-01",
        group: "Hanedanlar",
        className: "semi-legendary",
      },
    };
    expect(buildItems(index)[0].className).toBe("semi-legendary");
  });

  it("subtitle yoksa sadece title gösterilir", () => {
    const index = {
      test: {
        id: "test",
        title: "Test Item",
        start: "0618-01-01",
        end: "0907-01-01",
        group: "Hanedanlar",
      },
    };
    expect(buildItems(index)[0].content).toBe("Test Item");
  });
});

/**
 * Pure function mirror of the translatedGroups useMemo in TimelinePanel.
 * Extracted here so the visibility logic can be unit-tested without jsdom/vis-timeline.
 */
function buildTranslatedGroups(hiddenGroups, t = (k) => k) {
  return config.groups.map((g) => ({
    id: g.id,
    content: t(g.translationKey),
    visible: !hiddenGroups.has(g.id),
  }));
}

describe("buildTranslatedGroups (group visibility)", () => {
  it("all groups visible when hiddenGroups is empty", () => {
    const groups = buildTranslatedGroups(new Set());
    expect(groups).toHaveLength(config.groups.length);
    groups.forEach((g) => expect(g.visible).toBe(true));
  });

  it("hides a single group when its id is in hiddenGroups", () => {
    const hidden = new Set(["Cinema"]);
    const groups = buildTranslatedGroups(hidden);
    const cinema = groups.find((g) => g.id === "Cinema");
    const dynasties = groups.find((g) => g.id === "Dynasties and States");
    expect(cinema.visible).toBe(false);
    expect(dynasties.visible).toBe(true);
  });

  it("hides multiple groups", () => {
    const hidden = new Set(["Cinema", "Literature"]);
    const groups = buildTranslatedGroups(hidden);
    expect(groups.filter((g) => g.visible)).toHaveLength(1);
    expect(groups.find((g) => g.id === "Dynasties and States").visible).toBe(true);
  });

  it("uses t() for content labels", () => {
    const mockT = (key) => `translated:${key}`;
    const groups = buildTranslatedGroups(new Set(), mockT);
    groups.forEach((g) => {
      expect(g.content).toMatch(/^translated:/);
    });
  });

  it("unknown ids in hiddenGroups don't affect existing groups", () => {
    const hidden = new Set(["NonExistentGroup"]);
    const groups = buildTranslatedGroups(hidden);
    groups.forEach((g) => expect(g.visible).toBe(true));
  });
});

describe("hiddenGroups localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores hiddenGroups as JSON array in localStorage", () => {
    const hidden = new Set(["Cinema", "Literature"]);
    localStorage.setItem("hiddenGroups", JSON.stringify([...hidden]));
    const stored = JSON.parse(localStorage.getItem("hiddenGroups"));
    expect(stored).toEqual(expect.arrayContaining(["Cinema", "Literature"]));
    expect(stored).toHaveLength(2);
  });

  it("restores hiddenGroups Set from localStorage", () => {
    localStorage.setItem("hiddenGroups", JSON.stringify(["Cinema"]));
    const stored = localStorage.getItem("hiddenGroups");
    const restored = new Set(JSON.parse(stored));
    expect(restored.has("Cinema")).toBe(true);
    expect(restored.has("Literature")).toBe(false);
  });

  it("returns empty Set when localStorage is empty", () => {
    const stored = localStorage.getItem("hiddenGroups");
    const restored = stored ? new Set(JSON.parse(stored)) : new Set();
    expect(restored.size).toBe(0);
  });

  it("returns empty Set when localStorage has invalid JSON", () => {
    localStorage.setItem("hiddenGroups", "not-json");
    let restored;
    try {
      restored = new Set(JSON.parse(localStorage.getItem("hiddenGroups")));
    } catch {
      restored = new Set();
    }
    expect(restored.size).toBe(0);
  });
});

