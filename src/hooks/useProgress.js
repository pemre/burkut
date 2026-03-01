import { useState, useEffect, useCallback, useMemo } from "react";

const STORAGE_KEY = "readingProgress";
const SCHEMA_VERSION = 1;

/**
 * Default shape for persisted progress data.
 */
function defaultData() {
  return { version: SCHEMA_VERSION, completedIds: [], knownIds: [] };
}

/**
 * Read progress data from localStorage (with version guard).
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw);
    if (parsed.version !== SCHEMA_VERSION) return defaultData();
    return parsed;
  } catch {
    return defaultData();
  }
}

/**
 * Persist progress data to localStorage.
 */
function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* quota exceeded or private browsing — silently ignore */
  }
}

/**
 * Derive all trackable content IDs from the md-loader index.
 * Includes both header pages and sub-content items.
 */
export function getAllContentIds(index) {
  return Object.keys(index);
}

/**
 * useProgress — reading progress tracker hook.
 *
 * Tracks which content items have been marked "read" by the user.
 * Persists to localStorage. Detects newly added content (ids present in
 * the current index but absent from the stored knownIds) and exposes them
 * so the UI can display a "new content" modal.
 *
 * @param {Object} index — the md-loader index keyed by content id
 * @returns {{ toggleComplete, isComplete, completedCount, totalCount,
 *             percentage, newContentIds, acknowledgeNewContent, completedSet }}
 */
export function useProgress(index) {
  const [completedIds, setCompletedIds] = useState(() => {
    const stored = loadFromStorage();
    return new Set(stored.completedIds);
  });

  const [knownIds, setKnownIds] = useState(() => {
    const stored = loadFromStorage();
    return new Set(stored.knownIds);
  });

  const [newContentIds, setNewContentIds] = useState([]);

  // All content IDs derived from the current index
  const allIds = useMemo(() => getAllContentIds(index), [index]);

  // Detect new content & prune stale completed IDs whenever index changes
  useEffect(() => {
    if (allIds.length === 0) return; // index not loaded yet

    const currentSet = new Set(allIds);

    // Prune completedIds that no longer exist in index
    setCompletedIds((prev) => {
      const pruned = new Set([...prev].filter((id) => currentSet.has(id)));
      if (pruned.size !== prev.size) return pruned;
      return prev;
    });

    // Detect new content (ids not in stored knownIds)
    setKnownIds((prevKnown) => {
      if (prevKnown.size === 0) {
        // First launch — everything is "known", no modal
        setNewContentIds([]);
        return currentSet;
      }
      const newIds = allIds.filter((id) => !prevKnown.has(id));
      setNewContentIds(newIds);
      return prevKnown; // Don't update knownIds yet — wait for acknowledge
    });
  }, [allIds]);

  // Persist to localStorage whenever completedIds or knownIds change
  useEffect(() => {
    // Use the latest knownIds merged with allIds for persistence
    // (knownIds is only fully updated on acknowledge, but we always persist current state)
    saveToStorage({
      version: SCHEMA_VERSION,
      completedIds: [...completedIds],
      knownIds: [...knownIds],
    });
  }, [completedIds, knownIds]);

  const toggleComplete = useCallback((id) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const isComplete = useCallback(
    (id) => completedIds.has(id),
    [completedIds]
  );

  const totalCount = allIds.length;
  const completedCount = useMemo(
    () => allIds.filter((id) => completedIds.has(id)).length,
    [allIds, completedIds]
  );
  const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const acknowledgeNewContent = useCallback(() => {
    setKnownIds(new Set(allIds));
    setNewContentIds([]);
  }, [allIds]);

  return {
    toggleComplete,
    isComplete,
    completedCount,
    totalCount,
    percentage,
    newContentIds,
    acknowledgeNewContent,
    completedSet: completedIds,
  };
}

