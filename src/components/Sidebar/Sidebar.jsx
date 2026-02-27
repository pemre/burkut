import { useState, useEffect } from "react";
import "./Sidebar.css";

const GROUPS = ["Hanedanlar", "Edebiyat", "Sinema"];

export default function Sidebar({
  index,
  selectedId,
  activeGroup,
  onSelectItem,
  onSelectGroup,
}) {
  const [expanded, setExpanded] = useState({ [activeGroup]: true });

  // Seçilen item'ın grubu otomatik expand edilir
  useEffect(() => {
    if (activeGroup) {
      setExpanded((prev) => ({ ...prev, [activeGroup]: true }));
    }
  }, [activeGroup]);

  const toggleGroup = (group) => {
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }));
    onSelectGroup(group);
  };

  // index'ten gruba göre item'ları filtrele (background ve _index hariç)
  const itemsInGroup = (group) =>
    Object.values(index).filter(
      (item) => item.group === group && !item.id?.startsWith("bg_")
    );

  return (
    <nav className="sidebar" aria-label="İçerik menüsü">
      {GROUPS.map((group) => (
        <div key={group} className="sidebar-group">
          <button
            className={`sidebar-group-btn ${activeGroup === group ? "active" : ""}`}
            onClick={() => toggleGroup(group)}
            aria-expanded={!!expanded[group]}
          >
            <span className="sidebar-arrow">{expanded[group] ? "▼" : "▶"}</span>
            {group}
          </button>

          {expanded[group] && (
            <ul className="sidebar-items" role="list">
              {itemsInGroup(group).map((item) => (
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
