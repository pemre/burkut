import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import ContentPanel from "./components/ContentPanel/ContentPanel";
import MapPanel from "./components/MapPanel/MapPanel";
import TimelinePanel from "./components/TimelinePanel/TimelinePanel";
import { useMdLoader } from "./hooks/useMdLoader";
import "./styles/layout.css";

/**
 * Global state:
 *  selectedId  – tıklanan timeline/sidebar item id'si
 *  activeGroup – hangi grup seçili (Dynasties and States / Literature / Cinema)
 */
export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [activeGroup, setActiveGroup] = useState("Dynasties and States");

  const { index, getContent } = useMdLoader();

  const handleSelect = useCallback(
    (id) => {
      setSelectedId(id);
      if (index[id]) setActiveGroup(index[id].group);
    },
    [index]
  );

  const handleGroupSelect = useCallback((group) => {
    setActiveGroup(group);
    setSelectedId(null);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">🦅</span>
        <h1>Bürküt — History Explorer — Çin</h1>
      </header>

      <div className="app-body">
        {/* ── Sol menü ─────────────────────────────── */}
        <Sidebar
          index={index}
          selectedId={selectedId}
          activeGroup={activeGroup}
          onSelectItem={handleSelect}
          onSelectGroup={handleGroupSelect}
        />

        {/* ── Orta + Sağ üst panel ─────────────────── */}
        <main className="main-area">
          <div className="top-panels">
            <ContentPanel
              selectedId={selectedId}
              activeGroup={activeGroup}
              index={index}
              getContent={getContent}
            />
            <MapPanel selectedId={selectedId} index={index} />
          </div>

          {/* ── Alt timeline ────────────────────────── */}
          <TimelinePanel
            index={index}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </main>
      </div>
    </div>
  );
}
