import "./PanelHeader.css";

/**
 * Thin header bar for collapsible panels.
 * Shows a title, optional children (e.g. action buttons), and a chevron button
 * to toggle collapse/expand.
 *
 * @param {string}   title     — translated panel title
 * @param {boolean}  collapsed — whether the panel is currently collapsed
 * @param {Function} onToggle  — called when the chevron button is clicked
 * @param {"horizontal"|"vertical"} direction — panel resize axis
 * @param {React.ReactNode} children — optional action elements rendered between title and toggle
 */
export default function PanelHeader({ title, collapsed, onToggle, direction = "horizontal", children }) {
  const isVertical = direction === "vertical";

  // Chevron points toward the collapsible edge
  let chevron;
  if (isVertical) {
    chevron = collapsed ? "▲" : "▼";
  } else {
    chevron = collapsed ? "▶" : "◀";
  }

  return (
    <div className={`panel-header ${isVertical ? "panel-header--vertical" : ""}`}>
      <span className="panel-header__title">{title}</span>
      {children && <div className="panel-header__actions">{children}</div>}
      <button
        className="panel-header__toggle"
        onClick={onToggle}
        aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
        title={collapsed ? `Expand ${title}` : `Collapse ${title}`}
      >
        {chevron}
      </button>
    </div>
  );
}

