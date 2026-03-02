import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ContentIndex } from "../../hooks/useMdLoader";
import ContentPanel from "./ContentPanel";

/**
 * SPEC: ContentPanel component
 * ---------------------------
 * 1. getContent is called for selectedId
 * 2. Loading indicator is shown while loading
 * 3. Markdown content is rendered
 * 4. Meta info (title, tags) is displayed
 * 5. Fallback message shown when getContent returns null
 * 6. When selectedId is null, activeGroup header content is loaded
 * 7. Mark-as-read toggle renders and works
 * 8. Mark-as-read toggle shows done state when complete
 */

const mockIndex: ContentIndex = {
  xia: {
    id: "xia",
    group: "Dynasties and States",
    title: "Xia Dynasty",
    subtitle: "2070–1600 BCE",
    tags: ["legendary", "pre-bronze-age"],
    _path: "",
    _isHeader: false,
  },
  "Dynasties and States": {
    id: "Dynasties and States",
    group: "Dynasties and States",
    title: "Dynasties and States",
    _path: "",
    _isHeader: true,
  },
};

describe("ContentPanel", () => {
  it("renders content as markdown", async () => {
    const getContent = vi.fn().mockResolvedValue("## Test Heading\n\nTest content.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Test content.")).toBeInTheDocument();
    });
  });

  it("shows meta title and tags", async () => {
    const getContent = vi.fn().mockResolvedValue("Content.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />,
    );
    expect(screen.getByText("2070–1600 BCE")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("#legendary")).toBeInTheDocument();
    });
  });

  it("shows fallback when getContent returns null", async () => {
    const getContent = vi.fn().mockResolvedValue(null);
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/content\.notFound/)).toBeInTheDocument();
    });
  });

  it("loads activeGroup header content when selectedId is null", async () => {
    const getContent = vi.fn().mockResolvedValue("# Dynasties and States\n\nGroup description.");
    render(
      <ContentPanel
        selectedId={null}
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
      />,
    );
    expect(getContent).toHaveBeenCalledWith("Dynasties and States");
    await waitFor(() => {
      expect(screen.getByText("Group description.")).toBeInTheDocument();
    });
  });

  it("renders mark-as-read toggle button when onToggleComplete is provided", async () => {
    const getContent = vi.fn().mockResolvedValue("Content.");
    const onToggle = vi.fn();
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => false}
        onToggleComplete={onToggle}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("progress.markRead")).toBeInTheDocument();
    });
    const btn = screen.getByLabelText("progress.markRead");
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });

  it("mark-as-read toggle calls onToggleComplete with current id", async () => {
    const getContent = vi.fn().mockResolvedValue("Content.");
    const onToggle = vi.fn();
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => false}
        onToggleComplete={onToggle}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("progress.markRead")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByLabelText("progress.markRead"));
    expect(onToggle).toHaveBeenCalledWith("xia");
  });

  it("toggle shows done state when item is complete", async () => {
    const getContent = vi.fn().mockResolvedValue("Content.");
    render(
      <ContentPanel
        selectedId="xia"
        activeGroup="Dynasties and States"
        index={mockIndex}
        getContent={getContent}
        isComplete={() => true}
        onToggleComplete={vi.fn()}
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("progress.markUnread")).toBeInTheDocument();
    });
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
      />,
    );
    await waitFor(() => {
      expect(screen.getByLabelText("progress.markRead")).toBeInTheDocument();
    });
  });
});
