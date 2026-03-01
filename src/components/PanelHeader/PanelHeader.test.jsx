import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PanelHeader from "./PanelHeader";

/**
 * SPEC: PanelHeader bileşeni
 * --------------------------
 * 1. Renders title and toggle button
 * 2. Chevron reflects collapsed state (horizontal / vertical)
 * 3. Calls onToggle when chevron is clicked
 * 4. Renders children in the actions area when provided
 * 5. Does not render actions wrapper when no children are passed
 */

const baseProps = {
  title: "Timeline",
  collapsed: false,
  onToggle: vi.fn(),
};

describe("PanelHeader", () => {
  it("renders title text", () => {
    render(<PanelHeader {...baseProps} />);
    expect(screen.getByText("Timeline")).toBeInTheDocument();
  });

  it("calls onToggle when chevron is clicked", () => {
    const onToggle = vi.fn();
    render(<PanelHeader {...baseProps} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("button", { name: /collapse/i }));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it("shows expand chevron when collapsed (horizontal)", () => {
    render(<PanelHeader {...baseProps} collapsed={true} />);
    expect(screen.getByRole("button", { name: /expand/i })).toHaveTextContent("▶");
  });

  it("shows collapse chevron when expanded (horizontal)", () => {
    render(<PanelHeader {...baseProps} collapsed={false} />);
    expect(screen.getByRole("button", { name: /collapse/i })).toHaveTextContent("◀");
  });

  it("shows vertical chevrons when direction is vertical", () => {
    const { rerender } = render(
      <PanelHeader {...baseProps} direction="vertical" collapsed={false} />
    );
    expect(screen.getByRole("button", { name: /collapse/i })).toHaveTextContent("▼");

    rerender(
      <PanelHeader {...baseProps} direction="vertical" collapsed={true} />
    );
    expect(screen.getByRole("button", { name: /expand/i })).toHaveTextContent("▲");
  });

  it("renders children in actions area when provided", () => {
    render(
      <PanelHeader {...baseProps}>
        <button data-testid="child-btn">Action</button>
      </PanelHeader>
    );
    expect(screen.getByTestId("child-btn")).toBeInTheDocument();
    // actions wrapper should exist
    expect(screen.getByTestId("child-btn").closest(".panel-header__actions")).toBeTruthy();
  });

  it("does not render actions wrapper when no children", () => {
    const { container } = render(<PanelHeader {...baseProps} />);
    expect(container.querySelector(".panel-header__actions")).toBeNull();
  });
});

