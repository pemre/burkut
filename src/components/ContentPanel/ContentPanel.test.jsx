import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ContentPanel from "./ContentPanel";

/**
 * SPEC: ContentPanel bileşeni
 * ---------------------------
 * 1. selectedId için getContent çağrılır
 * 2. Yükleme sırasında "Yükleniyor" gösterilir
 * 3. Markdown içerik render edilir
 * 4. Meta bilgileri (title, tags) gösterilir
 * 5. getContent null dönerse fallback mesajı gösterilir
 * 6. selectedId null iken activeGroup header içeriği gösterilir
 */

const mockIndex = {
  xia: {
    id: "xia",
    group: "Dynasties and States",
    title: "Xia Hanedanı",
    subtitle: "MÖ 2070–1600",
    tags: ["efsanevi", "tunç-çağı-öncesi"],
    _isHeader: false,
  },
  "Dynasties and States": {
    id: "Dynasties and States",
    group: "Dynasties and States",
    title: "Hanedanlar ve Devletler",
    _isHeader: true,
  },
};

describe("ContentPanel", () => {
  it("içeriği markdown olarak render eder", async () => {
    const getContent = vi.fn().mockResolvedValue("## Test Başlık\n\nTest içerik.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />
    );
    await waitFor(() => {
      expect(screen.getByText("Test içerik.")).toBeInTheDocument();
    });
  });

  it("meta başlık ve tag'leri gösterir", async () => {
    const getContent = vi.fn().mockResolvedValue("İçerik.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />
    );
    expect(screen.getByText("Xia Hanedanı")).toBeInTheDocument();
    expect(screen.getByText("MÖ 2070–1600")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("#efsanevi")).toBeInTheDocument();
    });
  });

  it("getContent null dönünce fallback gösterilir", async () => {
    const getContent = vi.fn().mockResolvedValue(null);
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />
    );
    await waitFor(() => {
      expect(screen.getByText(/content\.notFound/)).toBeInTheDocument();
    });
  });

  it("selectedId null iken activeGroup header içeriği yüklenir", async () => {
    const getContent = vi.fn().mockResolvedValue("# Hanedanlar ve Devletler\n\nGrup açıklaması.");
    render(
      <ContentPanel
        selectedId={null}
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />
    );
    expect(getContent).toHaveBeenCalledWith("Dynasties and States");
    await waitFor(() => {
      expect(screen.getByText("Grup açıklaması.")).toBeInTheDocument();
    });
  });
});
