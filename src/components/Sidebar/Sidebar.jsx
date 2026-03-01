import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import config from "../../config";
import "./Sidebar.css";

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

  // index'ten gruba göre item'ları filtrele (background ve header hariç)
  const itemsInGroup = (groupId) =>
    Object.values(index).filter(
      (item) =>
        item.group === groupId &&
        // Toogle to hide certain files... E.g. We used to hide "type: background" items bcs
        // they used to have _bg_filename.md naming convention...
        // !item.id?.startsWith("bg_") &&
        !item._isHeader
    );

  console.log("ite", index);

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
                    className={`sidebar-item-btn ${selectedId === item.id ? "selected" : ""}`}
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
