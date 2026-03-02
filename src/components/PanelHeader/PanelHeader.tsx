import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";
import "./PanelHeader.css";

interface PanelHeaderProps {
  title: string;
  collapsed: boolean;
  onToggle: () => void;
  direction?: "horizontal" | "vertical";
  children?: ReactNode;
}

/**
 * Thin header bar for collapsible panels.
 * Shows a title, optional children (e.g. action buttons), and a chevron button
 * to toggle collapse/expand.
 */
export default function PanelHeader({
  title,
  collapsed,
  onToggle,
  direction = "horizontal",
  children,
}: PanelHeaderProps) {
  const isVertical = direction === "vertical";

  // Chevron points toward the collapsible edge
  let Chevron: typeof ChevronUp;
  if (isVertical) {
    Chevron = collapsed ? ChevronUp : ChevronDown;
  } else {
    Chevron = collapsed ? ChevronRight : ChevronLeft;
  }

  return (
    <div className={`panel-header ${isVertical ? "panel-header--vertical" : ""}`}>
      <span className="panel-header__title">{title}</span>
      {children && <div className="panel-header__actions">{children}</div>}
      <button
        type="button"
        className="panel-header__toggle"
        onClick={onToggle}
        aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
      >
        <Chevron size={14} />
      </button>
    </div>
  );
}
