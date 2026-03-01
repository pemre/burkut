import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import config from "../../config";
import "./Sidebar.css";

/**
 * Parse a front-matter `start` string (e.g. "-002070-01-01", "0581-01-01")
 * into a comparable numeric value. Handles negative (BCE) years correctly.
 * Returns NaN for missing/invalid values so they sort to the end.
 */
function parseStartValue(start) {
  if (!start) return NaN;
  // Negative years like "-002070-01-01"
  const match = start.match(/^(-?\d+)-(\d{2})-(\d{2})$/);
  if (!match) return NaN;
  return parseInt(match[1], 10);
}

export default function Sidebar({
  index,
  selectedId,
  activeGroup,
  onSelectItem,
  onSelectGroup,
}) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState({ [activeGroup]: true });

  // Seçilen item'ın grubu otomatik expand edilir
  useEffect(() => {
    if (activeGroup) {
      setExpanded((prev) => ({ ...prev, [activeGroup]: true }));
    }
  }, [activeGroup]);

  const toggleGroup = (groupId) => {
    setExpanded((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    onSelectGroup(groupId);
  };

  // Find the group header entry to read sidebarSort config
  const getGroupHeader = (groupId) =>
    Object.values(index).find(
      (item) => item.group === groupId && item._isHeader
    );

  // index'ten gruba göre item'ları filtrele (background ve header hariç)
  const itemsInGroup = (groupId) => {
    const header = getGroupHeader(groupId);
    const sortMode = header?.sidebarSort;

    const items = Object.values(index).filter(
      (item) =>
        item.group === groupId &&
        !item._isHeader
    );

    if (sortMode === "start") {
      items.sort((a, b) => {
        const aVal = parseStartValue(a.start);
        const bVal = parseStartValue(b.start);
        // Items without a valid start go to the end
        if (isNaN(aVal) && isNaN(bVal)) return 0;
        if (isNaN(aVal)) return 1;
        if (isNaN(bVal)) return -1;
        if (aVal !== bVal) return aVal - bVal;
        // Equal start: background (period) items come first
        const aBg = a.type === "background" ? 0 : 1;
        const bBg = b.type === "background" ? 0 : 1;
        return aBg - bBg;
      });
    } else {
      // Default: alphabetical by title
      items.sort((a, b) => (a.title || a.id).localeCompare(b.title || b.id));
    }

    return items;
  };

  return (
    <nav className="sidebar" aria-label={t("aria.sidebar")}>
      {config.groups.map((group) => (
        <div key={group.id} className="sidebar-group">
          <button
            className={`sidebar-group-btn ${activeGroup === group.id ? "active" : ""}`}
            onClick={() => toggleGroup(group.id)}
            aria-expanded={!!expanded[group.id]}
          >
            <span className="sidebar-arrow">{expanded[group.id] ? "▼" : "▶"}</span>
            {t(group.translationKey)}
          </button>

          {expanded[group.id] && (
            <ul className="sidebar-items" role="list">
              {itemsInGroup(group.id).map((item) => (
                <li key={item.id}>
                  <button
                    className={[
                      "sidebar-item-btn",
                      selectedId === item.id ? "selected" : "",
                      item.type === "background" ? "sidebar-item-subheader" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => onSelectItem(item.id)}
                    title={item.subtitle || ""}
                  >
                    {item.title || item.id}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}
