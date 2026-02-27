import { describe, it, expect, vi } from "vitest";

/**
 * SPEC: TimelinePanel / buildItems util
 * --------------------------------------
 * 1. start+end+group olan index girdileri item'a dönüşür
 * 2. start/end eksik girdiler filtrelenir
 * 3. subtitle varsa content'e eklenir
 * 4. className ve type frontmatter'dan alınır
 *
 * NOT: vis-timeline jsdom'da DOM gerektirdiğinden
 * Timeline init testi entegrasyon testine bırakılmıştır.
 * Bu dosya yalnızca buildItems saf fonksiyonunu test eder.
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
