import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
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
 * 7. Mark-as-read toggle renders and works
 * 8. Mark-as-read toggle shows done state when complete
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

  it("renders mark-as-read toggle button when onToggleComplete is provided", async () => {
    const getContent = vi.fn().mockResolvedValue("İçerik.");
    const onToggle = vi.fn();
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => false}
        onToggleComplete={onToggle}
      />
    );
    const btn = screen.getByLabelText("progress.markRead");
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("✓");
  });

  it("mark-as-read toggle calls onToggleComplete with current id", async () => {
    const getContent = vi.fn().mockResolvedValue("İçerik.");
    const onToggle = vi.fn();
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => false}
        onToggleComplete={onToggle}
      />
    );
    fireEvent.click(screen.getByLabelText("progress.markRead"));
    expect(onToggle).toHaveBeenCalledWith("xia");
  });

  it("toggle shows done state when item is complete", async () => {
    const getContent = vi.fn().mockResolvedValue("İçerik.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => true}
        onToggleComplete={vi.fn()}
      />
    );
    const btn = screen.getByLabelText("progress.markUnread");
    expect(btn).toHaveClass("read-toggle--done");
  });

  it("shows mark-as-read toggle for group header pages (no selectedId)", async () => {
    const getContent = vi.fn().mockResolvedValue("# Header\n\nContent.");
    render(
      <ContentPanel
        selectedId={null}
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => false}
        onToggleComplete={vi.fn()}
      />
    );
    const btn = screen.getByLabelText("progress.markRead");
    expect(btn).toBeInTheDocument();
  });
});
