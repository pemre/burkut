import { useEffect, useRef, useMemo } from "react";
import { Timeline, DataSet } from "vis-timeline/standalone";
import "vis-timeline/styles/vis-timeline-graph2d.min.css";
import "./TimelinePanel.css";

const GROUPS = [
  { id: "Hanedanlar", content: "Hanedanlıklar ve devletler" },
  { id: "Edebiyat", content: "Edebiyat" },
  { id: "Sinema", content: "Sinema" },
];

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
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const items = useMemo(() => buildItems(index), [index]);

  // Timeline'ı bir kez init et
  useEffect(() => {
    if (!containerRef.current || timelineRef.current) return;

    const ds = new DataSet(items);
    const groups = new DataSet(GROUPS);

    const tl = new Timeline(containerRef.current, ds, groups, {
      start: "-001800-01-01",
      end: "2100-01-01",
    });

    tl.on("select", ({ items: selected }) => {
      if (selected.length > 0) onSelect(selected[0]);
    });

    timelineRef.current = { tl, ds };

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

  // Dışarıdan selectedId değişince timeline'ı focus et
  useEffect(() => {
    if (!timelineRef.current || !selectedId) return;
    const { tl } = timelineRef.current;
    tl.setSelection([selectedId]);
    try { tl.focus(selectedId); } catch (_) {}
  }, [selectedId]);

  return (
    <div className="timeline-panel" aria-label="Zaman çizelgesi">
      <div ref={containerRef} className="timeline-container" />
    </div>
  );
}
