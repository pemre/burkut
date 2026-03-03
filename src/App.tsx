import { Github, RotateCcw } from "lucide-react";
import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import NewContentModal from "./components/NewContentModal/NewContentModal";
import ProgressPie from "./components/ProgressPie/ProgressPie";
import ThemeToggle from "./components/ThemeToggle/ThemeToggle";
import { Button } from "./components/ui";
import { WidgetGrid } from "./components/WidgetGrid/WidgetGrid";
import { WidgetVisibilityMenu } from "./components/WidgetVisibilityMenu/WidgetVisibilityMenu";
import config from "./config";
import { useLayoutPersistence } from "./hooks/useLayoutPersistence";
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
  const { resetLayout, visibilityState, setWidgetVisible, layouts, onLayoutChange } =
    useLayoutPersistence();

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

  /** Toggle a vis.js group's visibility on the timeline */
  const toggleGroup = useCallback((groupId: string) => {
    setHiddenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const timelineHeaderChildren = config.groups.map((g) => {
    const isHidden = hiddenGroups.has(g.id);
    return (
      <button
        type="button"
        key={g.id}
        className={`timeline-group-toggle ${
          isHidden ? "timeline-group-toggle--hidden" : "timeline-group-toggle--active"
        }`}
        onClick={() => toggleGroup(g.id)}
        aria-pressed={!isHidden}
        title={isHidden ? `Show ${t(g.translationKey)}` : `Hide ${t(g.translationKey)}`}
      >
        {t(g.translationKey)}
      </button>
    );
  });

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-logo">{config.app.logo}</span>
        <h1>{t("app.title")}</h1>

        {config.features.progressTracker && <ProgressPie percentage={percentage} />}

        {config.features.darkLightToggle && <ThemeToggle />}

        {config.features.draggableLayout && (
          <Button
            variant="icon"
            onClick={resetLayout}
            aria-label={t("layout.reset")}
            title={t("layout.reset")}
          >
            <RotateCcw size={16} />
          </Button>
        )}

        {config.features.draggableLayout && (
          <WidgetVisibilityMenu
            visibilityState={visibilityState}
            setWidgetVisible={setWidgetVisible}
          />
        )}

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

        <Button
          variant="icon"
          href="https://github.com/pemre/burkut"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <Github size={18} />
        </Button>
      </header>

      <div className="app-body">
        <WidgetGrid
          layouts={layouts}
          visibilityState={visibilityState}
          onLayoutChange={onLayoutChange}
          setWidgetVisible={setWidgetVisible}
          index={index}
          selectedId={selectedId}
          activeGroup={activeGroup}
          onSelectItem={handleSelect}
          onSelectGroup={handleGroupSelect}
          completedSet={completedSet}
          getContent={getContent}
          isComplete={isComplete}
          onToggleComplete={toggleComplete}
          onSelect={handleSelect}
          hiddenGroups={hiddenGroups}
          timelineHeaderChildren={timelineHeaderChildren}
        />
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
