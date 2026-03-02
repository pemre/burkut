import { Github } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Group, Panel, Separator, useDefaultLayout } from "react-resizable-panels";
import ContentPanel from "./components/ContentPanel/ContentPanel";
import MapPanel from "./components/MapPanel/MapPanel";
import NewContentModal from "./components/NewContentModal/NewContentModal";
import PanelHeader from "./components/PanelHeader/PanelHeader";
import ProgressPie from "./components/ProgressPie/ProgressPie";
import Sidebar from "./components/Sidebar/Sidebar";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import TimelinePanel from "./components/TimelinePanel/TimelinePanel";
import config from "./config";
import { useMdLoader } from "./hooks/useMdLoader";
import { useProgress } from "./hooks/useProgress";
import "./styles/layout.css";

/**
 * Global state:
 *  selectedId  – clicked timeline/sidebar item id
 *  activeGroup – which group is selected (from config.groups)
 */
export default function App() {
  const { t, i18n } = useTranslation();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState(config.defaults.activeGroup);

  // Collapse state for each panel
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapCollapsed, setMapCollapsed] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  /** Set of vis.js group ids currently hidden on the timeline (persisted) */
  const [hiddenGroups, setHiddenGroups] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("hiddenGroups");
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  // Persist hidden groups to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("hiddenGroups", JSON.stringify([...hiddenGroups]));
    } catch {
      /* quota exceeded or private browsing — silently ignore */
    }
  }, [hiddenGroups]);

  // Panel refs for imperative collapse/expand
  const sidebarPanelRef = useRef(null);
  const mapPanelRef = useRef(null);
  const timelinePanelRef = useRef(null);

  // Persistence via useDefaultLayout for each Group
  const rootLayout = useDefaultLayout({ id: "layout-root", storage: localStorage });
  const mainLayout = useDefaultLayout({ id: "layout-main", storage: localStorage });
  const topLayout = useDefaultLayout({ id: "layout-top", storage: localStorage });

  const { index, getContent } = useMdLoader();
  const {
    toggleComplete,
    isComplete,
    percentage,
    newContentIds,
    acknowledgeNewContent,
    completedSet,
  } = useProgress(index);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (index[id]?.group) setActiveGroup(index[id].group);
    },
    [index],
  );

  const handleGroupSelect = useCallback((group: string) => {
    setActiveGroup(group);
    setSelectedId(null);
  }, []);

  const handleLanguageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const lng = e.target.value;
      i18n.changeLanguage(lng);
      document.title = t("app.htmlTitle", { lng });
    },
    [i18n, t],
  );

  const toggleSidebar = useCallback(() => {
    const panel = sidebarPanelRef.current as {
      isCollapsed: () => boolean;
      expand: () => void;
      collapse: () => void;
    } | null;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleMap = useCallback(() => {
    const panel = mapPanelRef.current as {
      isCollapsed: () => boolean;
      expand: () => void;
      collapse: () => void;
    } | null;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  const toggleTimeline = useCallback(() => {
    const panel = timelinePanelRef.current as {
      isCollapsed: () => boolean;
      expand: () => void;
      collapse: () => void;
    } | null;
    if (!panel) return;
    if (panel.isCollapsed()) panel.expand();
    else panel.collapse();
  }, []);

  /** Toggle a vis.js group's visibility on the timeline */
  const toggleGroup = useCallback((groupId: string) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  // Track collapsed state via onResize
  const handleSidebarResize = useCallback((size: { asPercentage: number }) => {
    setSidebarCollapsed(size.asPercentage <= 2);
  }, []);

  const handleMapResize = useCallback((size: { asPercentage: number }) => {
    setMapCollapsed(size.asPercentage <= 2);
  }, []);

  const handleTimelineResize = useCallback((size: { asPercentage: number }) => {
    setTimelineCollapsed(size.asPercentage <= 3);
  }, []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">{config.app.logo}</span>
        <h1>{t("app.title")}</h1>

        {config.features.progressTracker && <ProgressPie percentage={percentage} />}

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

        <a
          href="https://github.com/pemre/burkut"
          target="_blank"
          aria-label="GitHub"
          title="GitHub"
          style={{ lineHeight: 1 }}
          rel="noreferrer"
        >
          <Github size={18} />
        </a>
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
                  completedSet={completedSet}
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
                        isComplete={isComplete}
                        onToggleComplete={toggleComplete}
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
                      {!mapCollapsed && <MapPanel selectedId={selectedId} index={index} />}
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
                  >
                    {!timelineCollapsed &&
                      config.groups.map((g) => {
                        const isHidden = hiddenGroups.has(g.id);
                        return (
                          <button
                            type="button"
                            key={g.id}
                            className={`timeline-group-toggle ${
                              isHidden
                                ? "timeline-group-toggle--hidden"
                                : "timeline-group-toggle--active"
                            }`}
                            onClick={() => toggleGroup(g.id)}
                            aria-pressed={!isHidden}
                            title={
                              isHidden
                                ? `Show ${t(g.translationKey)}`
                                : `Hide ${t(g.translationKey)}`
                            }
                          >
                            {t(g.translationKey)}
                          </button>
                        );
                      })}
                  </PanelHeader>
                  {!timelineCollapsed && (
                    <TimelinePanel
                      index={index}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                      hiddenGroups={hiddenGroups}
                    />
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {config.features.progressTracker && newContentIds.length > 0 && (
        <NewContentModal
          newContentIds={newContentIds}
          index={index}
          percentage={percentage}
          onDismiss={acknowledgeNewContent}
        />
      )}
    </div>
  );
}
