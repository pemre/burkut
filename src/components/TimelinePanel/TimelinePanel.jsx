import { useEffect, useRef, useMemo, useCallback } from "react";
import { Timeline, DataSet } from "vis-timeline/standalone";
import { useTranslation } from "react-i18next";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import config from "../../config";
import { useResizeObserver } from "../../hooks/useResizeObserver";
import "./TimelinePanel.css";

/**
 * index'teki frontmatter verisinden vis.js item'larını üretir.
 * Başlık: title + subtitle (yoksa id)
 */
function buildItems(index) {
  return Object.values(index)
    .filter((m) => m.start && m.end && m.group)
    .map((m) => ({
      id: m.id,
      content: m.subtitle
        ? `${m.title || m.id}<br><small>${m.subtitle}</small>`
        : m.title || m.id,
      start: m.start,
      end: m.end,
      group: m.group,
      className: m.className || "",
      type: m.type || "range",
    }));
}

export default function TimelinePanel({ index, selectedId, onSelect }) {
  const { t, i18n } = useTranslation();
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const items = useMemo(() => buildItems(index), [index]);

  /** Build translated vis.js groups from config */
  const translatedGroups = useMemo(
    () =>
      config.groups.map((g) => ({ id: g.id, content: t(g.translationKey) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n.language]
  );

  // Timeline'ı bir kez init et
  useEffect(() => {
    if (!containerRef.current || timelineRef.current) return;

    const ds = new DataSet(items);
    const gs = new DataSet(translatedGroups);

    const tl = new Timeline(containerRef.current, ds, gs, {
      start: "-001800-01-01",
      end: "2100-01-01",
      min: "-001800-01-01",
      max: "2100-01-01",
    });

    tl.on("select", ({ items: selected }) => {
      if (selected.length > 0) onSelect(selected[0]);
    });

    timelineRef.current = { tl, ds, gs };

    return () => {
      tl.destroy();
      timelineRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // items güncellenince DataSet'i güncelle
  useEffect(() => {
    if (!timelineRef.current) return;
    const { ds } = timelineRef.current;
    ds.clear();
    ds.add(items);
  }, [items]);

  // Dil değişince group label'larını güncelle
  useEffect(() => {
    if (!timelineRef.current) return;
    const { gs } = timelineRef.current;
    gs.clear();
    gs.add(translatedGroups);
  }, [translatedGroups]);

  // Dışarıdan selectedId değişince timeline'ı focus et
  useEffect(() => {
    if (!timelineRef.current || !selectedId) return;
    const { tl } = timelineRef.current;
    tl.setSelection([selectedId]);
    try { tl.focus(selectedId); } catch (_) {}
  }, [selectedId]);

  // Redraw vis-timeline when the container is resized (e.g. panel drag)
  const handleResize = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.tl.redraw();
    }
  }, []);
  useResizeObserver(containerRef, handleResize);

  return (
    <div className="timeline-panel" aria-label={t("aria.timeline")}>
      <div ref={containerRef} className="timeline-container" />
    </div>
  );
}
