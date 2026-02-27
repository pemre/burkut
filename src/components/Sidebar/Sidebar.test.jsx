import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Sidebar from "./Sidebar";

/**
 * SPEC: Sidebar bileşeni
 * ----------------------
 * 1. Tüm gruplar listelenir (translation key'leri ile)
 * 2. Aktif grup expand görünür
 * 3. Item tıklandığında onSelectItem(id) çağrılır
 * 4. Grup tıklandığında onSelectGroup(group) çağrılır
 * 5. selectedId item'ı "selected" class alır
 *
 * NOT: react-i18next global mock ile t(key) → key döner.
 *      Bu yüzden render edilen text translationKey değerleridir.
 */

const mockIndex = {
  xia: { id: "xia", group: "Dynasties and States", title: "Xia Hanedanı", _isHeader: false },
  shang: { id: "shang", group: "Dynasties and States", title: "Shang Hanedanı", _isHeader: false },
  ed_1: { id: "ed_1", group: "Literature", title: "Yazının Doğuşu", _isHeader: false },
  "Dynasties and States": {
    id: "Dynasties and States",
    group: "Dynasties and States",
    title: "Hanedanlar ve Devletler",
    _isHeader: true,
  },
  Cinema: {
    id: "Cinema",
    group: "Cinema",
    title: "Çin Sineması",
    _isHeader: true,
  },
};

const defaultProps = {
  index: mockIndex,
  selectedId: null,
  activeGroup: "Dynasties and States",
  onSelectItem: vi.fn(),
  onSelectGroup: vi.fn(),
};

describe("Sidebar", () => {
  it("tüm grupları render eder", () => {
    render(<Sidebar {...defaultProps} />);
    // i18n mock returns keys as-is
    expect(screen.getByText("groups.dynasties")).toBeInTheDocument();
    expect(screen.getByText("groups.literature")).toBeInTheDocument();
    expect(screen.getByText("groups.cinema")).toBeInTheDocument();
  });

  it("aktif grubun item'larını gösterir", () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText("Xia Hanedanı")).toBeInTheDocument();
    expect(screen.getByText("Shang Hanedanı")).toBeInTheDocument();
  });

  it("item tıklandığında onSelectItem çağrılır", () => {
    const onSelectItem = vi.fn();
    render(<Sidebar {...defaultProps} onSelectItem={onSelectItem} />);
    fireEvent.click(screen.getByText("Xia Hanedanı"));
    expect(onSelectItem).toHaveBeenCalledWith("xia");
  });

  it("grup tıklandığında onSelectGroup çağrılır", () => {
    const onSelectGroup = vi.fn();
    render(<Sidebar {...defaultProps} onSelectGroup={onSelectGroup} />);
    fireEvent.click(screen.getByText("groups.literature"));
    expect(onSelectGroup).toHaveBeenCalledWith("Literature");
  });

  it("selectedId item'ı selected class alır", () => {
    render(<Sidebar {...defaultProps} selectedId="xia" />);
    const btn = screen.getByText("Xia Hanedanı").closest("button");
    expect(btn).toHaveClass("selected");
  });

  it("header item'ları sidebar listesinde gösterilmez", () => {
    render(<Sidebar {...defaultProps} activeGroup="Dynasties and States" />);
    // Header item should NOT appear as a sidebar list item
    const items = screen.getAllByRole("list")[0].querySelectorAll(".sidebar-item-btn");
    const texts = Array.from(items).map((el) => el.textContent);
    expect(texts).not.toContain("Hanedanlar ve Devletler");
    expect(texts).toContain("Xia Hanedanı");
    expect(texts).toContain("Shang Hanedanı");
  });
});
