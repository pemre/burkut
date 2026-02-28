import { useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import Sidebar from "./components/Sidebar/Sidebar";
import ContentPanel from "./components/ContentPanel/ContentPanel";
import MapPanel from "./components/MapPanel/MapPanel";
import TimelinePanel from "./components/TimelinePanel/TimelinePanel";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import PanelHeader from "./components/PanelHeader/PanelHeader";
import { useMdLoader } from "./hooks/useMdLoader";
import config from "./config";
import "./styles/layout.css";

/**
 * Global state:
 *  selectedId  – clicked timeline/sidebar item id
 *  activeGroup – which group is selected (from config.groups)
 */
export default function App() {
  const { t, i18n } = useTranslation();
  const [selectedId, setSelectedId] = useState(null);
  const [activeGroup, setActiveGroup] = useState(config.defaults.activeGroup);

  // Collapse state for each panel
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  // Panel refs for imperative collapse/expand
  const sidebarPanelRef = useRef(null);
  const mapPanelRef = useRef(null);
  const timelinePanelRef = useRef(null);

  // Persistence via useDefaultLayout for each Group
  const rootLayout = useDefaultLayout({ id: "layout-root", storage: localStorage });
  const mainLayout = useDefaultLayout({ id: "layout-main", storage: localStorage });
  const topLayout = useDefaultLayout({ id: "layout-top", storage: localStorage });

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

  const toggleSidebar = useCallback(() => {
    const panel = sidebarPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleMap = useCallback(() => {
    const panel = mapPanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleTimeline = useCallback(() => {
    const panel = timelinePanelRef.current;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  // Track collapsed state via onResize
  const handleSidebarResize = useCallback((size) => {
    setSidebarCollapsed(size.asPercentage <= 2);
  }, []);

  const handleMapResize = useCallback((size) => {
    setMapCollapsed(size.asPercentage <= 2);
  }, []);

  const handleTimelineResize = useCallback((size) => {
    setTimelineCollapsed(size.asPercentage <= 3);
  }, []);

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
        {/* ── Horizontal root: Sidebar | Main ──────────────── */}
        <Group
          orientation="horizontal"
          defaultLayout={rootLayout.defaultLayout}
          onLayoutChanged={rootLayout.onLayoutChanged}
        >
          <Panel
            id="sidebar"
            panelRef={sidebarPanelRef}
            defaultSize="15%"
            minSize="10%"
            collapsible
            collapsedSize="0%"
            onResize={handleSidebarResize}
          >
            {!sidebarCollapsed && (
              <div className="sidebar-wrapper">
                <PanelHeader
                  title={t("panels.sidebar")}
                  collapsed={sidebarCollapsed}
                  onToggle={toggleSidebar}
                />
                <Sidebar
                  index={index}
                  selectedId={selectedId}
                  activeGroup={activeGroup}
                  onSelectItem={handleSelect}
                  onSelectGroup={handleGroupSelect}
                />
              </div>
            )}
          </Panel>

          <Separator className="resize-handle resize-handle--horizontal">
            <div className="resize-handle__indicator" />
          </Separator>

          <Panel id="main" defaultSize="85%" minSize="40%">
            {/* ── Vertical main: Top panels | Timeline ───── */}
            <Group
              orientation="vertical"
              defaultLayout={mainLayout.defaultLayout}
              onLayoutChanged={mainLayout.onLayoutChanged}
            >
              <Panel id="top" defaultSize="75%" minSize="20%">
                {/* ── Horizontal top: Content | Map ────────── */}
                <Group
                  orientation="horizontal"
                  defaultLayout={topLayout.defaultLayout}
                  onLayoutChanged={topLayout.onLayoutChanged}
                >
                  <Panel id="content" defaultSize="65%" minSize="25%">
                    <div className="panel-with-header">
                      <ContentPanel
                        selectedId={selectedId}
                        activeGroup={activeGroup}
                        index={index}
                        getContent={getContent}
                      />
                    </div>
                  </Panel>

                  <Separator className="resize-handle resize-handle--horizontal">
                    <div className="resize-handle__indicator" />
                  </Separator>

                  <Panel
                    id="map"
                    panelRef={mapPanelRef}
                    defaultSize="35%"
                    minSize="15%"
                    collapsible
                    collapsedSize="0%"
                    onResize={handleMapResize}
                  >
                    <div className="panel-with-header">
                      <PanelHeader
                        title={t("panels.map")}
                        collapsed={mapCollapsed}
                        onToggle={toggleMap}
                      />
                      {!mapCollapsed && (
                        <MapPanel selectedId={selectedId} index={index} />
                      )}
                    </div>
                  </Panel>
                </Group>
              </Panel>

              <Separator className="resize-handle resize-handle--vertical">
                <div className="resize-handle__indicator" />
              </Separator>

              <Panel
                id="timeline"
                panelRef={timelinePanelRef}
                defaultSize="25%"
                minSize="10%"
                collapsible
                collapsedSize="0%"
                onResize={handleTimelineResize}
              >
                <div className="panel-with-header panel-with-header--vertical">
                  <PanelHeader
                    title={t("panels.timeline")}
                    collapsed={timelineCollapsed}
                    onToggle={toggleTimeline}
                    direction="vertical"
                  />
                  {!timelineCollapsed && (
                    <TimelinePanel
                      index={index}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                    />
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>
    </div>
  );
}
