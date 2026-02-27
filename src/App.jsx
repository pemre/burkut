import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Sidebar from "./components/Sidebar/Sidebar";
import ContentPanel from "./components/ContentPanel/ContentPanel";
import MapPanel from "./components/MapPanel/MapPanel";
import TimelinePanel from "./components/TimelinePanel/TimelinePanel";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import { useMdLoader } from "./hooks/useMdLoader";
import config from "./config";
import "./styles/layout.css";

/**
 * Global state:
 *  selectedId  – tıklanan timeline/sidebar item id'si
 *  activeGroup – hangi grup seçili (config.groups'tan)
 */
export default function App() {
  const { t, i18n } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(config.defaults.activeGroup);

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

  const handleLanguageChange = useCallback(
    (e) => {
      const lng = e.target.value;
      i18n.changeLanguage(lng);
      document.title = t("app.htmlTitle", { lng });
    },
    [i18n, t]
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">{config.app.logo}</span>
        <h1>{t("app.title")}</h1>

        {config.features.darkLightToggle && <ThemeToggle />}

        <select
          className="language-select"
          value={i18n.language}
          onChange={handleLanguageChange}
          aria-label={t("language")}
        >
          {config.app.supportedLocales.map((loc) => (
            <option key={loc.code} value={loc.code}>
              {loc.label}
            </option>
          ))}
        </select>
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
