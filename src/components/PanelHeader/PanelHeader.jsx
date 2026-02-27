import "./PanelHeader.css";

/**
 * Thin header bar for collapsible panels.
 * Shows a title and a chevron button to toggle collapse/expand.
 *
 * @param {string}   title     — translated panel title
 * @param {boolean}  collapsed — whether the panel is currently collapsed
 * @param {Function} onToggle  — called when the chevron button is clicked
 * @param {"horizontal"|"vertical"} direction — panel resize axis
 */
export default function PanelHeader({ title, collapsed, onToggle, direction = "horizontal" }) {
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

